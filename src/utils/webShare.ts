/** Web Share API — gratuita, nativa do navegador (principalmente útil no celular). */

import type { CNH, ServiceLinks, Vehicle } from '../types';
import { formatCpfDisplay, formatPlateDisplay } from './format';

export function isWebShareSupported(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}

export function canShareFiles(files: File[]): boolean {
  if (typeof navigator === 'undefined' || typeof navigator.canShare !== 'function') return false;
  try {
    return navigator.canShare({ files });
  } catch {
    return false;
  }
}

export type ShareBackupOutcome =
  | 'shared-file'
  | 'shared-text'
  | 'cancelled'
  | 'unsupported'
  | 'failed';

/**
 * Tenta compartilhar o JSON como arquivo; se o navegador não permitir arquivo,
 * compartilha um resumo em texto (backup completo continua disponível em Exportar JSON).
 */
export async function shareConsultaCarBackup(
  jsonPayload: object,
  filename: string,
  summaryText: string,
): Promise<ShareBackupOutcome> {
  if (!isWebShareSupported()) return 'unsupported';

  const json = JSON.stringify(jsonPayload, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const file = new File([blob], filename, { type: 'application/json' });

  try {
    if (canShareFiles([file])) {
      await navigator.share({
        files: [file],
        title: 'Backup Consulta Car',
        text: 'Arquivo de backup do Consulta Car',
      });
      return 'shared-file';
    }

    await navigator.share({
      title: 'Consulta Car',
      text: summaryText,
    });
    return 'shared-text';
  } catch (e) {
    const err = e as Error;
    if (err?.name === 'AbortError') return 'cancelled';
    return 'failed';
  }
}

export type ShareTextOutcome = 'shared' | 'cancelled' | 'unsupported' | 'failed';

export async function sharePlainText(title: string, text: string): Promise<ShareTextOutcome> {
  if (!isWebShareSupported()) return 'unsupported';
  try {
    await navigator.share({ title, text });
    return 'shared';
  } catch (e) {
    const err = e as Error;
    if (err?.name === 'AbortError') return 'cancelled';
    return 'failed';
  }
}

export function buildVehicleShareText(vehicle: Vehicle, links: ServiceLinks): string {
  const plate = formatPlateDisplay(vehicle.plate);
  const lines = [
    `Consulta Car — ${vehicle.nickname}`,
    `Placa: ${plate}`,
    `RENAVAM: ${vehicle.renavam}`,
    `Chassi: ${vehicle.chassis}`,
    '',
    'Atalhos (oficiais CE):',
    `IPVA: ${links.ipva}`,
    `Central DETRAN: ${links.licenciamento}`,
    `Multas: ${links.multas}`,
  ];
  if (vehicle.notes?.trim()) lines.push('', `Obs.: ${vehicle.notes.trim()}`);
  return lines.join('\n');
}

export function buildCnhShareText(cnh: CNH, links: ServiceLinks): string {
  const cpf = formatCpfDisplay(cnh.cpf);
  const lines = [
    `Consulta Car — CNH ${cnh.name}`,
    `Registro: ${cnh.number}`,
    `CPF: ${cpf}`,
    '',
    'Atalhos (oficiais CE):',
    `Serviços CNH: ${links.cnhPoints}`,
    `Nada consta: ${links.cnhClearance}`,
    `Renovação: ${links.cnhRenewal}`,
  ];
  if (cnh.notes?.trim()) lines.push('', `Obs.: ${cnh.notes.trim()}`);
  return lines.join('\n');
}

export async function shareVehicleSummary(vehicle: Vehicle, links: ServiceLinks): Promise<ShareTextOutcome> {
  return sharePlainText(`Consulta Car — ${vehicle.nickname}`, buildVehicleShareText(vehicle, links));
}

export async function shareCnhSummary(cnh: CNH, links: ServiceLinks): Promise<ShareTextOutcome> {
  return sharePlainText(`Consulta Car — ${cnh.name}`, buildCnhShareText(cnh, links));
}

/** Texto longo para fallback quando o navegador não compartilha arquivo — placas, RENAVAM e links. */
export function buildBackupShareSummaryText(
  vehicles: Vehicle[],
  cnhs: CNH[],
  links: ServiceLinks,
): string {
  const lines: string[] = [
    'Consulta Car — resumo dos cadastros',
    `Gerado: ${new Date().toLocaleString('pt-BR')}`,
    '',
    `Veículos (${vehicles.length}):`,
  ];
  for (const v of vehicles) {
    lines.push(
      `• ${v.nickname} — placa ${formatPlateDisplay(v.plate)} | RENAVAM ${v.renavam}`,
    );
  }
  lines.push('', `CNH (${cnhs.length}):`);
  for (const c of cnhs) {
    lines.push(`• ${c.name} — CPF ${formatCpfDisplay(c.cpf)}`);
  }
  lines.push(
    '',
    'Atalhos oficiais (Ceará):',
    `IPVA: ${links.ipva}`,
    `DETRAN Central: ${links.licenciamento}`,
    `Multas: ${links.multas}`,
    `Serviços CNH: ${links.cnhPoints}`,
    '',
    'Backup JSON completo: use «Exportar JSON» ou «Compartilhar» no app.',
  );
  return lines.join('\n');
}
