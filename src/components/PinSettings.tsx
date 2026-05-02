import React, { useState } from 'react';
import { Shield, ShieldOff } from 'lucide-react';
import {
  clearPinStorage,
  clearSessionUnlock,
  isPinConfigured,
  PIN_HASH_KEY,
  PIN_SALT_KEY,
  saveNewPin,
  verifyPin,
} from '../utils/pin';
import { BiometricSettings } from './BiometricSettings';

type Props = { toast: (msg: string) => void };

export function PinSettings({ toast }: Props) {
  const [configured, setConfigured] = useState(() => isPinConfigured());
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const [mode, setMode] = useState<'idle' | 'change' | 'remove'>('idle');

  const activate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length < 4 || newPin !== confirmPin) {
      toast('PIN deve ter pelo menos 4 dígitos e confirmação igual.');
      return;
    }
    await saveNewPin(newPin);
    setConfigured(true);
    setNewPin('');
    setConfirmPin('');
    toast('PIN ativado.');
  };

  const changePin = async (e: React.FormEvent) => {
    e.preventDefault();
    const salt = localStorage.getItem(PIN_SALT_KEY);
    const hash = localStorage.getItem(PIN_HASH_KEY);
    if (!salt || !hash) return;
    const ok = await verifyPin(currentPin, salt, hash);
    if (!ok) {
      toast('PIN atual incorreto.');
      return;
    }
    if (newPin.length < 4 || newPin !== confirmPin) {
      toast('Novo PIN inválido ou confirmação diferente.');
      return;
    }
    await saveNewPin(newPin);
    setMode('idle');
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    toast('PIN alterado.');
  };

  const removePin = async (e: React.FormEvent) => {
    e.preventDefault();
    const salt = localStorage.getItem(PIN_SALT_KEY);
    const hash = localStorage.getItem(PIN_HASH_KEY);
    if (!salt || !hash) return;
    const ok = await verifyPin(currentPin, salt, hash);
    if (!ok) {
      toast('PIN incorreto.');
      return;
    }
    clearPinStorage();
    clearSessionUnlock();
    setConfigured(false);
    setMode('idle');
    setCurrentPin('');
    toast('PIN removido.');
  };

  const lockNow = () => {
    clearSessionUnlock();
    toast('Sessão bloqueada. Recarregue a página ou feche a aba.');
    window.location.reload();
  };

  return (
    <div className="border-t border-ink/8 pt-8 mt-8">
      <h4 className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-4">Segurança</h4>
      <p className="text-sm text-muted mb-4 leading-relaxed">
        Um PIN opcional protege os dados ao abrir o app neste navegador (armazenamento local).
      </p>

      {!configured && mode === 'idle' && (
        <form onSubmit={activate} className="space-y-3 max-w-md">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted uppercase">Novo PIN</label>
              <input
                type="password"
                inputMode="numeric"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
                className="mt-1 w-full rounded-xl border border-ink/8 bg-canvas px-3 py-2.5 font-mono text-sm outline-none focus:border-brand"
                placeholder="mín. 4 dígitos"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted uppercase">Confirmar</label>
              <input
                type="password"
                inputMode="numeric"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
                className="mt-1 w-full rounded-xl border border-ink/8 bg-canvas px-3 py-2.5 font-mono text-sm outline-none focus:border-brand"
              />
            </div>
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-emphasis"
          >
            <Shield size={18} aria-hidden />
            Ativar PIN
          </button>
        </form>
      )}

      {configured && mode === 'idle' && (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setMode('change');
              setCurrentPin('');
              setNewPin('');
              setConfirmPin('');
            }}
            className="rounded-xl border border-ink/8 bg-canvas px-4 py-2.5 text-sm font-semibold hover:bg-brand-soft"
          >
            Alterar PIN
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('remove');
              setCurrentPin('');
            }}
            className="rounded-xl border border-ink/8 bg-canvas px-4 py-2.5 text-sm font-semibold hover:bg-danger-soft hover:text-danger"
          >
            Remover PIN
          </button>
          <button
            type="button"
            onClick={lockNow}
            className="inline-flex items-center gap-2 rounded-xl border border-ink/8 px-4 py-2.5 text-sm font-semibold hover:bg-canvas"
          >
            <ShieldOff size={18} aria-hidden />
            Bloquear agora
          </button>
        </div>
      )}

      {configured && mode === 'change' && (
        <form onSubmit={changePin} className="space-y-3 max-w-md">
          <label className="text-xs font-semibold text-muted uppercase">PIN atual</label>
          <input
            type="password"
            inputMode="numeric"
            value={currentPin}
            onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
            className="w-full rounded-xl border border-ink/8 bg-canvas px-3 py-2.5 font-mono text-sm outline-none focus:border-brand"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted uppercase">Novo PIN</label>
              <input
                type="password"
                inputMode="numeric"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
                className="mt-1 w-full rounded-xl border border-ink/8 bg-canvas px-3 py-2.5 font-mono text-sm outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted uppercase">Confirmar</label>
              <input
                type="password"
                inputMode="numeric"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
                className="mt-1 w-full rounded-xl border border-ink/8 bg-canvas px-3 py-2.5 font-mono text-sm outline-none focus:border-brand"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white">
              Salvar
            </button>
            <button type="button" onClick={() => setMode('idle')} className="rounded-xl border px-4 py-2.5 text-sm">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {configured && mode === 'remove' && (
        <form onSubmit={removePin} className="space-y-3 max-w-sm">
          <label className="text-xs font-semibold text-muted uppercase">PIN atual para remover</label>
          <input
            type="password"
            inputMode="numeric"
            value={currentPin}
            onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
            className="w-full rounded-xl border border-ink/8 bg-canvas px-3 py-2.5 font-mono text-sm outline-none focus:border-brand"
          />
          <div className="flex gap-2">
            <button type="submit" className="rounded-xl bg-danger px-4 py-2.5 text-sm font-semibold text-white">
              Remover PIN
            </button>
            <button type="button" onClick={() => setMode('idle')} className="rounded-xl border px-4 py-2.5 text-sm">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {configured && <BiometricSettings toast={toast} />}
    </div>
  );
}
