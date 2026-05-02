import React, { useState } from 'react';
import { Fingerprint, Lock } from 'lucide-react';
import { PIN_HASH_KEY, PIN_SALT_KEY, setSessionUnlocked, verifyPin } from '../utils/pin';
import {
  authenticateWithWebAuthn,
  hasRegisteredCredential,
  isPublicKeyCredentialSupported,
} from '../utils/webauthnLocal';

type Props = {
  onUnlocked: () => void;
};

export function PinOverlay({ onUnlocked }: Props) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [bioBusy, setBioBusy] = useState(false);

  const canTryBio = isPublicKeyCredentialSupported() && hasRegisteredCredential();

  const tryBiometric = async () => {
    setBioBusy(true);
    setError(null);
    try {
      const ok = await authenticateWithWebAuthn();
      if (ok) {
        setSessionUnlocked();
        setPin('');
        onUnlocked();
      } else {
        setError('Não foi possível validar.');
      }
    } catch {
      setError('Cancelado ou indisponível.');
    } finally {
      setBioBusy(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const salt = localStorage.getItem(PIN_SALT_KEY);
    const hash = localStorage.getItem(PIN_HASH_KEY);
    if (!salt || !hash) {
      onUnlocked();
      return;
    }
    setPending(true);
    setError(null);
    try {
      const ok = await verifyPin(pin, salt, hash);
      if (ok) {
        setSessionUnlocked();
        setPin('');
        onUnlocked();
      } else {
        setError('PIN incorreto.');
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-ink/90 backdrop-blur-md">
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-surface p-8 shadow-2xl">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand-emphasis">
          <Lock size={28} strokeWidth={2} aria-hidden />
        </div>
        <h2 className="text-center text-xl font-bold text-ink mb-1">Desbloquear</h2>
        <p className="text-center text-sm text-muted mb-6">Digite seu PIN para abrir o Consulta Car.</p>
        {canTryBio && (
          <button
            type="button"
            disabled={bioBusy}
            onClick={() => void tryBiometric()}
            className="mb-5 w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-brand/35 bg-brand-soft/40 py-3 text-sm font-semibold text-brand-emphasis hover:bg-brand-soft disabled:opacity-50"
          >
            <Fingerprint size={20} aria-hidden />
            {bioBusy ? 'Aguardando…' : 'Usar biometria ou chave de segurança'}
          </button>
        )}
        <form onSubmit={submit} className="space-y-4">
          <input
            type="password"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="PIN"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value.replace(/\D/g, '').slice(0, 8));
              setError(null);
            }}
            className="w-full rounded-2xl border-2 border-transparent bg-canvas px-4 py-3.5 text-center text-lg font-mono tracking-[0.3em] text-ink outline-none transition focus:border-brand"
            autoFocus
          />
          {error && <p className="text-center text-sm text-danger">{error}</p>}
          <button
            type="submit"
            disabled={pending || pin.length < 4}
            className="w-full rounded-2xl bg-brand py-3.5 font-bold text-white shadow-lg shadow-brand/25 transition hover:bg-brand-emphasis disabled:opacity-50"
          >
            {pending ? 'Verificando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
