export const PLATFORM_SECTION_IDS = [
  "academic-intelligence",
  "growth-path",
  "growth-navigator",
  "services",
] as const;

export type PlatformSectionId = (typeof PLATFORM_SECTION_IDS)[number];

export function scrollToPlatformSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}
