/**
 * Resolve a public/ asset path for both Vite dev and GitHub Pages project sites.
 * Data should store repo-relative paths without a host-root leading slash
 * (e.g. `baoyan/sources/foo.pdf`, not `/baoyan/sources/foo.pdf`).
 */
export function resolvePublicAsset(path: string): string {
  const normalized = path.replace(/^\//, "").replace(/^\.?\//, "");
  const base = import.meta.env.BASE_URL;
  if (!base || base === "./") {
    return `./${normalized}`;
  }
  const withSlash = base.endsWith("/") ? base : `${base}/`;
  return `${withSlash}${normalized}`;
}

export function localPdfFilename(path: string): string {
  const segments = path.replace(/^\//, "").split("/");
  return segments[segments.length - 1] || "document.pdf";
}
