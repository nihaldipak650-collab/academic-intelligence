import { localPdfFilename, resolvePublicAsset } from "../../lib/resolvePublicAsset";

interface BaoyanLocalPdfLinksProps {
  localPdfPath: string;
  linkClassName?: string;
  viewLabel?: string;
  downloadLabel?: string;
}

export function BaoyanLocalPdfLinks({
  localPdfPath,
  linkClassName = "baoyan-source-link baoyan-source-link--pdf",
  viewLabel = "查看 PDF",
  downloadLabel = "下载 PDF",
}: BaoyanLocalPdfLinksProps) {
  const href = resolvePublicAsset(localPdfPath);
  const filename = localPdfFilename(localPdfPath);

  return (
    <>
      <a className={linkClassName} href={href} target="_blank" rel="noopener noreferrer">
        {viewLabel}
      </a>
      <a className={linkClassName} href={href} download={filename}>
        {downloadLabel}
      </a>
    </>
  );
}
