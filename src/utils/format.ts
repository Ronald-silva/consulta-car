/** Normaliza placa para armazenamento (sem espaços/hífen, maiúsculas). */
export function normalizePlate(raw: string): string {
  return raw.replace(/[\s-]/g, '').toUpperCase().slice(0, 7);
}

/** Mercosul LLLNLNN ou antiga LLLNNNN — validação leve. */
export function isValidPlate(p: string): boolean {
  const s = normalizePlate(p);
  if (s.length !== 7) return false;
  const mercosul = /^[A-Z]{3}[0-9][A-J0-9][0-9]{2}$/;
  const antiga = /^[A-Z]{3}[0-9]{4}$/;
  return mercosul.test(s) || antiga.test(s);
}

/** Formata placa enquanto digita (até 7 caracteres). */
export function formatPlateDisplay(stored: string): string {
  const s = normalizePlate(stored);
  if (s.length === 0) return '';
  if (s.length <= 3) return s;
  return `${s.slice(0, 3)} ${s.slice(3)}`;
}

export function digitsOnly(s: string): string {
  return s.replace(/\D/g, '');
}

export function normalizeRenavam(raw: string): string {
  return digitsOnly(raw).slice(0, 11);
}

export function normalizeYear(raw: string): string {
  return digitsOnly(raw).slice(0, 4);
}

export function normalizeChassis(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, '');
}

export function formatCpfInput(raw: string): string {
  const d = digitsOnly(raw).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

export function formatCpfDisplay(storedDigits: string): string {
  const d = digitsOnly(storedDigits).slice(0, 11);
  return formatCpfInput(d);
}

export function isValidCpf(digits: string): boolean {
  const d = digitsOnly(digits);
  if (d.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(d)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(d[i], 10) * (10 - i);
  let mod = (sum * 10) % 11;
  if (mod === 10 || mod === 11) mod = 0;
  if (mod !== parseInt(d[9], 10)) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(d[i], 10) * (11 - i);
  mod = (sum * 10) % 11;
  if (mod === 10 || mod === 11) mod = 0;
  return mod === parseInt(d[10], 10);
}
