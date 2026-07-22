param(
    [ValidateRange(1024, 65535)]
    [int]$Port = 8000,
    [switch]$SyncOnly
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$webRoot = Join-Path $projectRoot "web"
$sourceReports = Join-Path $projectRoot "data\reports"
$publicReports = Join-Path $webRoot "reports"
$configPath = Join-Path $webRoot "advisors.json"

New-Item -ItemType Directory -Force -Path $publicReports | Out-Null
$advisors = Get-Content -LiteralPath $configPath -Raw -Encoding UTF8 | ConvertFrom-Json
foreach ($advisor in $advisors) {
    $reportName = [System.IO.Path]::GetFileName([string]$advisor.report)
    $source = Join-Path $sourceReports $reportName
    if (-not (Test-Path -LiteralPath $source -PathType Leaf)) {
        throw "Configured report not found: $source"
    }
    Copy-Item -LiteralPath $source -Destination (Join-Path $publicReports $reportName) -Force
}

if ($SyncOnly) {
    Write-Host "Synced $($advisors.Count) advisor reports."
    exit 0
}

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".md"   = "text/markdown; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
}

$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
$url = "http://localhost:$Port/"
$listener.Start()
Write-Host "Synced $($advisors.Count) advisor reports."
Write-Host "Academic Intelligence 0.1: $url"
Write-Host "Press Ctrl+C to stop."

try {
    while ($true) {
        $client = $listener.AcceptTcpClient()
        try {
            $stream = $client.GetStream()
            $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
            $requestLine = $reader.ReadLine()
            if ([string]::IsNullOrWhiteSpace($requestLine)) {
                continue
            }
            while (($headerLine = $reader.ReadLine()) -ne "" -and $null -ne $headerLine) { }

            $parts = $requestLine.Split(" ")
            $method = $parts[0]
            $rawTarget = if ($parts.Count -ge 2) { $parts[1] } else { "/" }
            $rawPath = $rawTarget.Split("?")[0]
            $requestPath = [System.Uri]::UnescapeDataString($rawPath).TrimStart("/")
            if ([string]::IsNullOrWhiteSpace($requestPath)) {
                $requestPath = "index.html"
            }

            $candidate = [System.IO.Path]::GetFullPath((Join-Path $webRoot $requestPath.Replace("/", "\")))
            $rootPrefix = [System.IO.Path]::GetFullPath($webRoot).TrimEnd("\") + "\"
            $isInsideWebRoot = $candidate.StartsWith($rootPrefix, [System.StringComparison]::OrdinalIgnoreCase)

            if (($method -eq "GET" -or $method -eq "HEAD") -and $isInsideWebRoot -and (Test-Path -LiteralPath $candidate -PathType Leaf)) {
                $body = [System.IO.File]::ReadAllBytes($candidate)
                $extension = [System.IO.Path]::GetExtension($candidate).ToLowerInvariant()
                $contentType = if ($mimeTypes.ContainsKey($extension)) { $mimeTypes[$extension] } else { "application/octet-stream" }
                $status = "200 OK"
            }
            else {
                $body = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
                $contentType = "text/plain; charset=utf-8"
                $status = "404 Not Found"
            }

            $headerText = "HTTP/1.1 $status`r`nContent-Type: $contentType`r`nContent-Length: $($body.Length)`r`nCache-Control: no-store`r`nConnection: close`r`n`r`n"
            $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($headerText)
            $stream.Write($headerBytes, 0, $headerBytes.Length)
            if ($method -ne "HEAD") {
                $stream.Write($body, 0, $body.Length)
            }
            $stream.Flush()
        }
        finally {
            if ($null -ne $reader) { $reader.Dispose() }
            $client.Close()
        }
    }
}
finally {
    $listener.Stop()
}
