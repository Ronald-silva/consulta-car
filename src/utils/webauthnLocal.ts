/**
 * WebAuthn opcional — desbloqueio local sem servidor.
 * Compatível com biometria / chave de segurança onde o navegador permitir.
 */

const CRED_KEY = 'consulta-car-webauthn-credential-id';
const USER_KEY = 'consulta-car-webauthn-user-handle';

function getRpId(): string {
  const h = window.location.hostname;
  if (h === 'localhost' || h === '127.0.0.1') return 'localhost';
  return h;
}

function bufferToBase64url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]!);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlToBuffer(s: string): ArrayBuffer {
  const pad = '='.repeat((4 - (s.length % 4)) % 4);
  const base64 = s.replace(/-/g, '+').replace(/_/g, '/') + pad;
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function randomChallenge(): ArrayBuffer {
  const buf = new Uint8Array(32);
  crypto.getRandomValues(buf);
  return buf.buffer;
}

function getOrCreateUserHandle(): Uint8Array {
  let id = localStorage.getItem(USER_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(USER_KEY, id);
  }
  return new TextEncoder().encode(id);
}

export function isPublicKeyCredentialSupported(): boolean {
  return typeof window.PublicKeyCredential !== 'undefined';
}

export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (!isPublicKeyCredentialSupported()) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable?.();
  } catch {
    return false;
  }
}

export function hasRegisteredCredential(): boolean {
  return Boolean(localStorage.getItem(CRED_KEY));
}

export function clearWebAuthnCredential(): void {
  localStorage.removeItem(CRED_KEY);
}

/** Registra credencial após o utilizador já ter provado identidade (ex.: PIN). */
export async function registerWebAuthnCredential(): Promise<void> {
  if (!isPublicKeyCredentialSupported()) throw new Error('WebAuthn não disponível neste navegador.');

  const challenge = randomChallenge();
  const cred = (await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: { name: 'Consulta Car', id: getRpId() },
      user: {
        id: getOrCreateUserHandle(),
        name: 'consulta-car-local',
        displayName: 'Consulta Car',
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' },
        { alg: -257, type: 'public-key' },
      ],
      authenticatorSelection: {
        userVerification: 'preferred',
        residentKey: 'preferred',
      },
      timeout: 60000,
      attestation: 'none',
    },
  })) as PublicKeyCredential | null;

  if (!cred) throw new Error('Registro cancelado.');
  localStorage.setItem(CRED_KEY, bufferToBase64url(cred.rawId));
}

export async function authenticateWithWebAuthn(): Promise<boolean> {
  if (!isPublicKeyCredentialSupported()) return false;
  const stored = localStorage.getItem(CRED_KEY);
  if (!stored) return false;

  const challenge = randomChallenge();
  const assertion = (await navigator.credentials.get({
    publicKey: {
      challenge,
      allowCredentials: [{ id: base64urlToBuffer(stored), type: 'public-key' }],
      userVerification: 'preferred',
      timeout: 60000,
    },
  })) as PublicKeyCredential | null;

  if (!assertion?.response) return false;

  try {
    const clientData = JSON.parse(
      new TextDecoder().decode(assertion.response.clientDataJSON),
    ) as { challenge?: string };
    const expected = bufferToBase64url(challenge);
    return clientData.challenge === expected;
  } catch {
    return false;
  }
}
