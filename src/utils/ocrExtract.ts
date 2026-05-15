import { digitsOnly, isValidCpf, isValidPlate, normalizePlate } from './format';

export type VehicleOcrFill = {
  plate?: string;
  renavam?: string;
  chassis?: string;
  brandModel?: string;
  year?: string;
};

export type CnhOcrFill = {
  name?: string;
  number?: string;
  cpf?: string;
};

/** Gera variações comuns de confusão O/0, I/1 em posições numéricas da placa. */
function plateOcrVariants(s: string): string[] {
  const u = normalizePlate(s);
  if (u.length !== 7) return [];
  const out = new Set<string>([u]);
  const arr = u.split('');
  const tryDigitIdx = [3, 4, 5, 6];
  for (const pos of tryDigitIdx) {
    if (pos >= arr.length) continue;
    const c = arr[pos];
    if (c === 'O') {
      const copy = [...arr];
      copy[pos] = '0';
      out.add(copy.join(''));
    }
    if (c === 'I' || c === 'L') {
      const copy = [...arr];
      copy[pos] = '1';
      out.add(copy.join(''));
    }
  }
  return [...out];
}

function collectValidPlatesFromText(raw: string): string[] {
  const compact = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const found = new Set<string>();
  for (let i = 0; i <= compact.length - 7; i++) {
    const window = compact.slice(i, i + 7);
    for (const v of plateOcrVariants(window)) {
      const p = normalizePlate(v);
      if (isValidPlate(p)) found.add(p);
    }
  }
  return [...found];
}

function pickPlateNearLabel(raw: string, candidates: string[]): string | undefined {
  if (candidates.length === 0) return undefined;
  if (candidates.length === 1) return candidates[0];
  const u = raw.toUpperCase();
  const label = u.search(/\bPLACA\b/);
  if (label < 0) return candidates[0];
  const window = u.slice(label, label + 100).replace(/[^A-Z0-9]/g, '');
  for (const c of candidates) {
    if (window.includes(c)) return c;
  }
  return candidates[0];
}

function pickRenavam(raw: string): string | undefined {
  const flat = raw.toUpperCase().replace(/\s/g, '');
  const labelIdx = flat.indexOf('RENAVAM');
  if (labelIdx >= 0) {
    const tail = digitsOnly(flat.slice(labelIdx, labelIdx + 48));
    for (let j = 0; j <= tail.length - 11; j++) {
      const cand = tail.slice(j, j + 11);
      if (!isValidCpf(cand)) return cand;
    }
  }
  const d = digitsOnly(raw);
  for (let i = 0; i <= d.length - 11; i++) {
    const cand = d.slice(i, i + 11);
    if (!isValidCpf(cand)) return cand;
  }
  return undefined;
}

function isProbableVin(s: string): boolean {
  if (s.length !== 17) return false;
  let letters = 0;
  let digits = 0;
  for (const ch of s) {
    if (/[A-Z]/.test(ch)) letters += 1;
    else if (/[0-9]/.test(ch)) digits += 1;
    else return false;
  }
  return letters >= 3 && digits >= 3;
}

function extractChassis(raw: string): string | undefined {
  const upper = raw.toUpperCase();
  const lines = upper.split(/\n/);
  for (const line of lines) {
    if (!/CHASSI|CHASSIS/.test(line)) continue;
    const after = line.split(/[:;]/).pop() ?? line;
    const alnum = after.replace(/[^A-Z0-9]/g, '');
    for (let i = 0; i <= alnum.length - 17; i++) {
      const slice = alnum.slice(i, i + 17);
      if (isProbableVin(slice)) return slice;
    }
  }
  const u = upper.replace(/[^A-Z0-9]/g, '');
  for (let i = 0; i <= u.length - 17; i++) {
    const slice = u.slice(i, i + 17);
    if (isProbableVin(slice)) return slice;
  }
  return undefined;
}

function pickYear(raw: string): string | undefined {
  const re = /\b(19[89]\d|20\d{2})\b/g;
  const matches = raw.match(re);
  if (!matches?.length) return undefined;
  const currentY = new Date().getFullYear();
  const nums = matches
    .map((m) => Number(m))
    .filter((y) => y >= 1980 && y <= currentY + 2);
  if (!nums.length) return undefined;
  const upperLines = raw.toUpperCase().split(/\n/);
  for (const line of upperLines) {
    if (!/(FABRICA|MODELO|ANO\s|ANO\/)/.test(line)) continue;
    const m = line.match(re);
    if (m) return m[0];
  }
  return String(Math.min(...nums));
}

function pickBrandModel(raw: string): string | undefined {
  const lines = raw.split(/\n/).map((l) => l.trim());
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    const u = l.toUpperCase();
    if (!/MARCA|MODELO/.test(u)) continue;
    const parts = l.split(/[:;|]/);
    if (parts.length >= 2) {
      const v = parts.slice(1).join(' ').trim();
      if (v.length >= 3 && v.length < 120) return v.replace(/\s+/g, ' ');
    }
    const next = lines[i + 1];
    if (next && !/^[\d\s./-]+$/.test(next) && next.length >= 3 && next.length < 120) {
      return next.replace(/\s+/g, ' ');
    }
  }
  return undefined;
}

export function parseCrlvFromOcr(raw: string): VehicleOcrFill {
  const candidates = collectValidPlatesFromText(raw);
  const plate = pickPlateNearLabel(raw, candidates);
  return {
    plate,
    renavam: pickRenavam(raw),
    chassis: extractChassis(raw),
    brandModel: pickBrandModel(raw),
    year: pickYear(raw),
  };
}

function pickFirstValidCpf(raw: string): string | undefined {
  const d = digitsOnly(raw);
  for (let i = 0; i <= d.length - 11; i++) {
    const c = d.slice(i, i + 11);
    if (isValidCpf(c)) return c;
  }
  return undefined;
}

function pickCnhRegistro(raw: string, cpf?: string): string | undefined {
  const d = digitsOnly(raw);
  const elevens: string[] = [];
  for (let i = 0; i <= d.length - 11; i++) {
    elevens.push(d.slice(i, i + 11));
  }
  for (const e of elevens) {
    if (cpf && e === cpf) continue;
    if (!isValidCpf(e)) return e;
  }
  for (const e of elevens) {
    if (cpf && e === cpf) continue;
    return e;
  }
  return undefined;
}

function pickNomeCondutor(raw: string): string | undefined {
  const lines = raw.split(/\n/).map((l) => l.trim()).filter(Boolean);
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (!/^nome\b/i.test(l) && !/^\d+\.?\s*nome\b/i.test(l)) continue;
    const rest = l.replace(/^\d*\.?\s*nome\s*[\/:,-]?\s*/i, '').trim();
    if (rest.length >= 6) return rest.replace(/\s+/g, ' ').slice(0, 100);
    const next = lines[i + 1];
    if (next && next.length >= 6 && /^[A-Za-zÀ-ÿ\s.'-]+$/.test(next)) {
      return next.replace(/\s+/g, ' ').slice(0, 100);
    }
  }
  return undefined;
}

export function parseCnhFromOcr(raw: string): CnhOcrFill {
  const cpf = pickFirstValidCpf(raw);
  return {
    cpf,
    number: pickCnhRegistro(raw, cpf),
    name: pickNomeCondutor(raw),
  };
}
