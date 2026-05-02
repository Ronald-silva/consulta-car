import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import type { CNH, Vehicle } from '../types';
import { OFFICIAL_SERVICE_LINKS } from '../constants/serviceLinks';
import { BackupSection } from './BackupSection';
import { PinSettings } from './PinSettings';
import { ThemeSection } from './ThemeSection';

type Props = {
  open: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  cnhs: CNH[];
  onImport: (vehicles: Vehicle[], cnhs: CNH[]) => void;
  toast: (msg: string) => void;
};

const PORTAL_ROWS: { title: string; subtitle: string; url: string }[] = [
  { title: 'IPVA', subtitle: 'SEFAZ Ceará', url: OFFICIAL_SERVICE_LINKS.ipva },
  {
    title: 'Licenciamento e multas',
    subtitle: 'DETRAN Ceará — Central',
    url: OFFICIAL_SERVICE_LINKS.licenciamento,
  },
  {
    title: 'Serviços CNH',
    subtitle: 'Pontos, nada consta, renovação — DETRAN CE',
    url: OFFICIAL_SERVICE_LINKS.cnhPoints,
  },
];

export function ExtrasModal({ open, onClose, vehicles, cnhs, onImport, toast }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[75] flex items-start md:items-center justify-center p-4 overflow-y-auto">
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
        aria-labelledby="extras-modal-title"
        className="relative z-10 w-full max-w-lg rounded-3xl border border-ink/8 bg-surface p-6 md:p-8 shadow-2xl shadow-ink/20 my-auto max-h-[92vh] overflow-y-auto"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-xl p-2 text-muted hover:bg-canvas hover:text-ink transition-colors"
          aria-label="Fechar"
        >
          <X size={22} />
        </button>

        <h2 id="extras-modal-title" className="text-xl md:text-2xl font-bold text-ink mb-2 pr-10">
          Privacidade e backup
        </h2>
        <p className="text-sm text-muted mb-8 leading-relaxed">
          Os atalhos dos cartões abrem sempre estes portais oficiais. Se os endereços mudarem no futuro, eles serão
          atualizados na próxima versão do app.
        </p>

        <div className="rounded-2xl border border-ink/8 bg-canvas/50 p-4 mb-8">
          <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-3">Atalhos do app</p>
          <ul className="space-y-2">
            {PORTAL_ROWS.map((row) => (
              <li key={row.title}>
                <a
                  href={row.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 rounded-xl border border-ink/8 bg-surface px-4 py-3 text-left transition hover:border-brand/30 hover:shadow-sm"
                >
                  <span>
                    <span className="block text-sm font-semibold text-ink">{row.title}</span>
                    <span className="block text-xs text-muted">{row.subtitle}</span>
                  </span>
                  <ExternalLink size={18} className="shrink-0 text-brand" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-muted mb-6 leading-relaxed">
          Seus cadastros ficam só neste dispositivo (navegador). Use o backup para não perder tudo ao limpar dados ou
          trocar de aparelho. No Android, após instalar o app na tela inicial, use os atalhos Garagem e CNH no ícone do
          Consulta Car.
        </p>

        <ThemeSection />

        <BackupSection vehicles={vehicles} cnhs={cnhs} onImport={onImport} toast={toast} />

        <PinSettings toast={toast} />
      </motion.div>
    </div>
  );
}
