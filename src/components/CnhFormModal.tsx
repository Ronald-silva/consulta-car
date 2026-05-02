import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { motion } from 'motion/react';
import type { CNH } from '../types';
import { digitsOnly, formatCpfDisplay, formatCpfInput, isValidCpf } from '../utils/format';

type Props = {
  open: boolean;
  initial: CNH | null;
  onClose: () => void;
  onSave: (c: CNH) => void;
};

export function CnhFormModal({ open, initial, onClose, onSave }: Props) {
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [cpfDisplay, setCpfDisplay] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (initial) {
      setName(initial.name);
      setNumber(initial.number);
      setCpfDisplay(formatCpfDisplay(initial.cpf));
      setNotes(initial.notes ?? '');
    } else {
      setName('');
      setNumber('');
      setCpfDisplay('');
      setNotes('');
    }
  }, [open, initial]);

  if (!open) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const cpf = digitsOnly(cpfDisplay);
    if (!isValidCpf(cpf)) {
      setError('CPF inválido.');
      return;
    }
    const cnh: CNH = {
      id: initial?.id ?? crypto.randomUUID(),
      name: name.trim(),
      number: number.trim(),
      cpf,
      sortOrder: initial?.sortOrder,
      pinned: initial?.pinned,
      notes: notes.trim() || undefined,
    };
    onSave(cnh);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-start md:items-center justify-center p-4 overflow-y-auto">
      <motion.button
        type="button"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        aria-label="Fechar"
        className="fixed inset-0 bg-ink/45 backdrop-blur-sm cursor-default"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cnh-modal-title"
        className="relative z-10 w-full max-w-md rounded-3xl border border-ink/8 bg-surface p-6 md:p-8 shadow-2xl shadow-ink/20 my-auto max-h-[90vh] overflow-y-auto"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 md:top-6 md:right-6 rounded-xl p-2 text-muted hover:bg-canvas hover:text-ink transition-colors"
          aria-label="Fechar"
        >
          <X size={22} />
        </button>

        <h3 id="cnh-modal-title" className="text-xl md:text-2xl font-bold text-ink mb-6 pr-10">
          {initial ? 'Editar CNH' : 'Dados da CNH'}
        </h3>

        <form onSubmit={submit} className="space-y-5">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted ml-0.5">Nome completo</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-2xl border-2 border-transparent bg-canvas px-4 py-3.5 text-sm font-medium outline-none focus:border-brand focus:bg-surface"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted ml-0.5">Nº registro CNH</label>
              <input
                required
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="rounded-2xl border-2 border-transparent bg-canvas px-4 py-3.5 font-mono text-sm outline-none focus:border-brand focus:bg-surface"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted ml-0.5">CPF</label>
              <input
                required
                value={cpfDisplay}
                onChange={(e) => setCpfDisplay(formatCpfInput(e.target.value))}
                inputMode="numeric"
                autoComplete="off"
                placeholder="000.000.000-00"
                className="rounded-2xl border-2 border-transparent bg-canvas px-4 py-3.5 font-mono text-sm outline-none focus:border-brand focus:bg-surface"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted ml-0.5">
              Observações (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex.: validade, local da segunda via…"
              rows={3}
              className="rounded-2xl border-2 border-transparent bg-canvas px-4 py-3 text-sm outline-none focus:border-brand focus:bg-surface min-h-[5rem] resize-y"
            />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-2xl bg-brand py-4 text-base font-bold text-white shadow-lg shadow-brand/25 transition hover:bg-brand-emphasis active:bg-brand-emphasis"
          >
            {initial ? 'Salvar' : 'Cadastrar'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
