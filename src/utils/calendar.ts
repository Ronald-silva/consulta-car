import type { Vehicle } from '../types';
import { formatPlateDisplay } from './format';

function icsEscape(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

/** Data YYYY-MM-DD do lembrete do veículo */
export function buildVehicleReminderIcs(vehicle: Vehicle): string | null {
  const due = vehicle.reminderDue?.trim();
  if (!due) return null;

  const plate = formatPlateDisplay(vehicle.plate);
  const label = vehicle.reminderLabel?.trim() || 'Lembrete';
  const summary = `Consulta Car — ${vehicle.nickname} (${label})`;
  const description = [
    `Veículo: ${vehicle.nickname}`,
    `Placa: ${plate}`,
    `RENAVAM: ${vehicle.renavam}`,
    vehicle.notes?.trim() ? `Obs.: ${vehicle.notes.trim()}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const uid = `${vehicle.id}-${due}@consulta-car.local`;
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Consulta Car//PT',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${icsEscape(uid)}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${due.replace(/-/g, '')}`,
    `SUMMARY:${icsEscape(summary)}`,
    `DESCRIPTION:${icsEscape(description)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function downloadIcsFile(body: string, filename: string): void {
  const blob = new Blob([body], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Link “Adicionar ao Google Agenda” — evento em dia inteiro */
export function googleCalendarTemplateUrl(vehicle: Vehicle): string | null {
  const due = vehicle.reminderDue?.trim();
  if (!due) return null;

  const plate = formatPlateDisplay(vehicle.plate);
  const label = vehicle.reminderLabel?.trim() || 'Lembrete';
  const title = `Consulta Car — ${vehicle.nickname} (${label})`;
  const details = [
    `Veículo: ${vehicle.nickname}`,
    `Placa: ${plate}`,
    `RENAVAM: ${vehicle.renavam}`,
    vehicle.notes?.trim() ? `Obs.: ${vehicle.notes.trim()}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const ymd = due.replace(/-/g, '');
  const next = new Date(due + 'T12:00:00');
  next.setDate(next.getDate() + 1);
  const endYmd = `${next.getFullYear()}${String(next.getMonth() + 1).padStart(2, '0')}${String(next.getDate()).padStart(2, '0')}`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    details,
    dates: `${ymd}/${endYmd}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
