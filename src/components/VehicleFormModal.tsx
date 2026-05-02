import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { motion } from 'motion/react';
import type { Vehicle } from '../types';
import {
  formatPlateDisplay,
  isValidPlate,
  normalizeChassis,
  normalizePlate,
  normalizeRenavam,
  normalizeYear,
} from '../utils/format';

type Props = {
  open: boolean;
  initial: Vehicle | null;
  onClose: () => void;
  onSave: (v: Vehicle) => void;
};

export function VehicleFormModal({ open, initial, onClose, onSave }: Props) {
  const [nickname, setNickname] = useState('');
  const [plate, setPlate] = useState('');
  const [renavam, setRenavam] = useState('');
  const [chassis, setChassis] = useState('');
  const [brandModel, setBrandModel] = useState('');
  const [year, setYear] = useState('');
  const [reminderDue, setReminderDue] = useState('');
  const [reminderLabel, setReminderLabel] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (initial) {
      setNickname(initial.nickname);
      setPlate(formatPlateDisplay(initial.plate));
      setRenavam(initial.renavam);
      setChassis(initial.chassis);
      setBrandModel(initial.brandModel);
      setYear(initial.year);
      setReminderDue(initial.reminderDue ?? '');
      setReminderLabel(initial.reminderLabel ?? '');
      setNotes(initial.notes ?? '');
    } else {
      setNickname('');
      setPlate('');
      setRenavam('');
      setChassis('');
      setBrandModel('');
      setYear('');
      setReminderDue('');
      setReminderLabel('');
      setNotes('');
    }
  }, [open, initial]);

  if (!open) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const np = normalizePlate(plate);
    if (!isValidPlate(np)) {
      setError('Placa inválida (use Mercosul ou formato antigo, 7 caracteres).');
      return;
    }
    const ny = normalizeYear(year);
    if (ny.length !== 4) {
      setError('Informe o ano com 4 dígitos.');
      return;
    }
    const vehicle: Vehicle = {
      id: initial?.id ?? crypto.randomUUID(),
      nickname: nickname.trim(),
      plate: np,
      renavam: normalizeRenavam(renavam),
      chassis: normalizeChassis(chassis),
      brandModel: brandModel.trim(),
      year: ny,
      sortOrder: initial?.sortOrder,
      pinned: initial?.pinned,
      reminderDue: reminderDue.trim() || undefined,
      reminderLabel: reminderLabel.trim() || undefined,
      notes: notes.trim() || undefined,
    };
    onSave(vehicle);
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
        aria-labelledby="vehicle-modal-title"
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

        <h3 id="vehicle-modal-title" className="text-xl md:text-2xl font-bold text-ink mb-6 pr-10">
          {initial ? 'Editar veículo' : 'Novo veículo'}
        </h3>

        <form onSubmit={submit} className="space-y-5">
          <Field label="Apelido (ex.: Meu carro)">
            <input
              required
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full rounded-2xl border-2 border-transparent bg-canvas px-4 py-3.5 text-sm font-medium outline-none focus:border-brand focus:bg-surface"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Placa">
              <input
                required
                value={plate}
                onChange={(e) => setPlate(formatPlateDisplay(e.target.value))}
                placeholder="ABC1D23"
                className="w-full rounded-2xl border-2 border-transparent bg-canvas px-4 py-3.5 font-mono text-sm uppercase outline-none focus:border-brand focus:bg-surface"
              />
            </Field>
            <Field label="RENAVAM">
              <input
                required
                value={renavam}
                onChange={(e) => setRenavam(normalizeRenavam(e.target.value))}
                className="w-full rounded-2xl border-2 border-transparent bg-canvas px-4 py-3.5 font-mono text-sm outline-none focus:border-brand focus:bg-surface"
              />
            </Field>
          </div>
          <Field label="Chassi">
            <input
              required
              value={chassis}
              onChange={(e) => setChassis(normalizeChassis(e.target.value))}
              className="w-full rounded-2xl border-2 border-transparent bg-canvas px-4 py-3.5 font-mono text-sm outline-none focus:border-brand focus:bg-surface"
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Marca / modelo">
              <input
                required
                value={brandModel}
                onChange={(e) => setBrandModel(e.target.value)}
                placeholder="VW Gol 1.0"
                className="w-full rounded-2xl border-2 border-transparent bg-canvas px-4 py-3.5 text-sm outline-none focus:border-brand focus:bg-surface"
              />
            </Field>
            <Field label="Ano">
              <input
                required
                value={year}
                onChange={(e) => setYear(normalizeYear(e.target.value))}
                placeholder="AAAA"
                inputMode="numeric"
                className="w-full rounded-2xl border-2 border-transparent bg-canvas px-4 py-3.5 font-mono text-sm outline-none focus:border-brand focus:bg-surface"
              />
            </Field>
          </div>
          <div className="rounded-2xl border border-dashed border-brand/30 bg-brand-soft/30 p-4 space-y-3">
            <p className="text-xs font-semibold text-brand-emphasis uppercase tracking-wider">Lembrete (opcional)</p>
            <Field label="Data (ex.: venc. licenciamento)">
              <input
                type="date"
                value={reminderDue}
                onChange={(e) => setReminderDue(e.target.value)}
                className="w-full rounded-xl border border-ink/8 bg-surface px-3 py-2.5 text-sm outline-none focus:border-brand"
              />
            </Field>
            <Field label="Descrição curta">
              <input
                value={reminderLabel}
                onChange={(e) => setReminderLabel(e.target.value)}
                placeholder="Ex.: Licenciamento 2026"
                className="w-full rounded-xl border border-ink/8 bg-canvas px-3 py-2.5 text-sm outline-none focus:border-brand"
              />
            </Field>
          </div>
          <Field label="Observações (opcional)">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex.: recibo na gaveta, contato do corretor…"
              rows={3}
              className="w-full resize-y rounded-2xl border-2 border-transparent bg-canvas px-4 py-3 text-sm outline-none focus:border-brand focus:bg-surface min-h-[5rem]"
            />
          </Field>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted ml-0.5">{label}</span>
      {children}
    </div>
  );
}
