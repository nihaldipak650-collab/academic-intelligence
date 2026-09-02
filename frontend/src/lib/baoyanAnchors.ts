/**
 * Resolve baoyan TOC anchor ids to DOM elements.
 * Q&A cards use item.id directly (e.g. qa-retake).
 */
export function resolveBaoyanAnchorElement(id: string): HTMLElement | null {
  return document.getElementById(id);
}

export function scrollToBaoyanAnchor(id: string) {
  const el = resolveBaoyanAnchorElement(id);
  if (!el) return;

  if (id.startsWith("grade-grade-") && el instanceof HTMLButtonElement) {
    el.click();
  }

  if (id === "history-tabs") {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  el.scrollIntoView({ behavior: "smooth", block: "start" });
}
