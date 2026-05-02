import React, { useState } from 'react';
import { Fingerprint } from 'lucide-react';
import {
  authenticateWithWebAuthn,
  clearWebAuthnCredential,
  hasRegisteredCredential,
  isPublicKeyCredentialSupported,
  registerWebAuthnCredential,
} from '../utils/webauthnLocal';
import { PIN_HASH_KEY, PIN_SALT_KEY, verifyPin } from '../utils/pin';

type Props = { toast: (msg: string) => void };

/** Renderizado só quando já existe PIN configurado. */
export function BiometricSettings({ toast }: Props) {
  const [hasCred, setHasCred] = useState(() => hasRegisteredCredential());
  const [busy, setBusy] = useState(false);
  const [showRemove, setShowRemove] = useState(false);
  const [pinRemove, setPinRemove] = useState('');

  if (!isPublicKeyCredentialSupported()) return null;

  const register = async () => {
    setBusy(true);
    try {
      await registerWebAuthnCredential();
      setHasCred(true);
      toast('Desbloqueio por biometria ou chave de segurança ativado.');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Registro cancelado ou indisponível.';
      toast(msg);
    } finally {
      setBusy(false);
    }
  };

  const testUnlock = async () => {
    setBusy(true);
    try {
      const ok = await authenticateWithWebAuthn();
      toast(ok ? 'Confere — pode usar este método na tela de bloqueio.' : 'Não foi possível validar.');
    } finally {
      setBusy(false);
    }
  };

  const removeCred = async (e: React.FormEvent) => {
    e.preventDefault();
    const salt = localStorage.getItem(PIN_SALT_KEY);
    const hash = localStorage.getItem(PIN_HASH_KEY);
    if (!salt || !hash) return;
    const ok = await verifyPin(pinRemove, salt, hash);
    if (!ok) {
      toast('PIN incorreto.');
      return;
    }
    clearWebAuthnCredential();
    setHasCred(false);
    setShowRemove(false);
    setPinRemove('');
    toast('Biometria / chave removida. Use o PIN para entrar.');
  };

  return (
    <div className="mt-8 pt-8 border-t border-ink/8">
      <h4 className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-4">Biometria e chave de segurança</h4>
      <p className="text-sm text-muted mb-4 leading-relaxed">
        Opcional: desbloquear com impressão digital, Face ID ou chave de segurança física, quando o navegador permitir.
        O PIN continua disponível como alternativa.
      </p>

      {!hasCred && (
        <button
          type="button"
          disabled={busy}
          onClick={() => void register()}
          className="inline-flex items-center gap-2 rounded-xl border border-brand/30 bg-brand-soft/50 px-4 py-2.5 text-sm font-semibold text-brand-emphasis hover:bg-brand-soft disabled:opacity-50"
        >
          <Fingerprint size={18} aria-hidden />
          {busy ? 'Aguardando…' : 'Ativar desbloqueio sem PIN'}
        </button>
      )}

      {hasCred && !showRemove && (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => void testUnlock()}
            className="rounded-xl border border-ink/8 bg-canvas px-4 py-2.5 text-sm font-semibold hover:bg-brand-soft disabled:opacity-50"
          >
            Testar agora
          </button>
          <button
            type="button"
            onClick={() => {
              setShowRemove(true);
              setPinRemove('');
            }}
            className="rounded-xl border border-ink/8 px-4 py-2.5 text-sm font-semibold text-danger hover:bg-danger-soft"
          >
            Remover biometria / chave
          </button>
        </div>
      )}

      {hasCred && showRemove && (
        <form onSubmit={(e) => void removeCred(e)} className="space-y-3 max-w-sm">
          <label className="text-xs font-semibold text-muted uppercase">PIN atual para confirmar</label>
          <input
            type="password"
            inputMode="numeric"
            value={pinRemove}
            onChange={(e) => setPinRemove(e.target.value.replace(/\D/g, '').slice(0, 8))}
            className="w-full rounded-xl border border-ink/8 bg-canvas px-3 py-2.5 font-mono text-sm outline-none focus:border-brand"
          />
          <div className="flex gap-2">
            <button type="submit" className="rounded-xl bg-danger px-4 py-2.5 text-sm font-semibold text-white">
              Confirmar remoção
            </button>
            <button type="button" onClick={() => setShowRemove(false)} className="rounded-xl border px-4 py-2.5 text-sm">
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
