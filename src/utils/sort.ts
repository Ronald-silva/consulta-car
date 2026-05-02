import type { CNH, Vehicle } from '../types';

export function sortVehicles(list: Vehicle[]): Vehicle[] {
  return [...list].sort((a, b) => {
    const pa = a.pinned ? 0 : 1;
    const pb = b.pinned ? 0 : 1;
    if (pa !== pb) return pa - pb;
    const oa = a.sortOrder ?? 0;
    const ob = b.sortOrder ?? 0;
    if (oa !== ob) return oa - ob;
    return a.nickname.localeCompare(b.nickname, 'pt-BR');
  });
}

export function sortCnhs(list: CNH[]): CNH[] {
  return [...list].sort((a, b) => {
    const pa = a.pinned ? 0 : 1;
    const pb = b.pinned ? 0 : 1;
    if (pa !== pb) return pa - pb;
    const oa = a.sortOrder ?? 0;
    const ob = b.sortOrder ?? 0;
    if (oa !== ob) return oa - ob;
    return a.name.localeCompare(b.name, 'pt-BR');
  });
}

export function nextSortOrder(list: { sortOrder?: number }[]): number {
  let max = 0;
  for (const x of list) {
    const o = x.sortOrder ?? 0;
    if (o > max) max = o;
  }
  return max + 10;
}
