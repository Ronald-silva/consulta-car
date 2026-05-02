import type { CNH, Vehicle } from '../types';

/** v2: só veículos e CNH — links são fixos no app */
export const BACKUP_VERSION = 2 as const;

export interface BackupPayloadV2 {
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  vehicles: Vehicle[];
  cnhs: CNH[];
}

/** Backup legado (exportações antigas) */
interface BackupPayloadV1 {
  version: 1;
  exportedAt: string;
  vehicles: Vehicle[];
  cnhs: CNH[];
  serviceLinks?: unknown;
}

export function buildBackup(vehicles: Vehicle[], cnhs: CNH[]): BackupPayloadV2 {
  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    vehicles,
    cnhs,
  };
}

export function parseBackupJson(raw: string): { vehicles: Vehicle[]; cnhs: CNH[] } {
  const data = JSON.parse(raw) as unknown;
  if (!data || typeof data !== 'object') throw new Error('Arquivo inválido.');
  const o = data as Record<string, unknown>;
  const ver = o.version;

  if (ver === 2 || ver === 1) {
    if (!Array.isArray(o.vehicles) || !Array.isArray(o.cnhs))
      throw new Error('Estrutura do backup inválida.');
    return { vehicles: o.vehicles as Vehicle[], cnhs: o.cnhs as CNH[] };
  }

  throw new Error(`Versão de backup não suportada (${String(ver)}).`);
}
