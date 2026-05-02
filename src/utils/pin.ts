import { clearWebAuthnCredential } from './webauthnLocal';

export const PIN_HASH_KEY = 'consulta-car-pin-hash';
export const PIN_SALT_KEY = 'consulta-car-pin-salt';
export const SESSION_UNLOCK = 'consulta-car-unlocked';

export function randomSalt(): string {
  return crypto.randomUUID();
}

export async function hashPin(pin: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${pin}`);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyPin(pin: string, salt: string, storedHash: string): Promise<boolean> {
  const h = await hashPin(pin, salt);
  return h === storedHash;
}

export function isPinConfigured(): boolean {
  return Boolean(localStorage.getItem(PIN_HASH_KEY) && localStorage.getItem(PIN_SALT_KEY));
}

export function isSessionUnlocked(): boolean {
  return sessionStorage.getItem(SESSION_UNLOCK) === '1';
}

export function setSessionUnlocked(): void {
  sessionStorage.setItem(SESSION_UNLOCK, '1');
}

export function clearSessionUnlock(): void {
  sessionStorage.removeItem(SESSION_UNLOCK);
}

export function clearPinStorage(): void {
  localStorage.removeItem(PIN_HASH_KEY);
  localStorage.removeItem(PIN_SALT_KEY);
  clearWebAuthnCredential();
}

export async function saveNewPin(pin: string): Promise<void> {
  const salt = randomSalt();
  const hash = await hashPin(pin, salt);
  localStorage.setItem(PIN_SALT_KEY, salt);
  localStorage.setItem(PIN_HASH_KEY, hash);
}
