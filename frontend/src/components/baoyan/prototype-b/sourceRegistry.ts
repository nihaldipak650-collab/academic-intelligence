import type { OfficialSource } from "../../../data/baoyanMockData";
import { OFFICIAL_SOURCES } from "../../../data/baoyanMockData";

export type SourceRegistry = Map<string, { index: number; source: OfficialSource }>;

export function buildSourceRegistry(ids: string[]): SourceRegistry {
  const registry: SourceRegistry = new Map();
  let n = 0;
  for (const id of ids) {
    const source = OFFICIAL_SOURCES[id];
    if (!source || registry.has(id)) continue;
    n += 1;
    registry.set(id, { index: n, source });
  }
  return registry;
}

export function collectAllSourceIds(...groups: string[][]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const group of groups) {
    for (const id of group) {
      if (!seen.has(id)) {
        seen.add(id);
        out.push(id);
      }
    }
  }
  return out;
}
