import React, { useRef, useState } from 'react';
import { Download, Upload, Share2 } from 'lucide-react';
import { OFFICIAL_SERVICE_LINKS } from '../constants/serviceLinks';
import type { CNH, Vehicle } from '../types';
import { buildBackup, parseBackupJson } from '../utils/backup';
import { buildBackupShareSummaryText, shareConsultaCarBackup } from '../utils/webShare';

type Props = {
  vehicles: Vehicle[];
  cnhs: CNH[];
  onImport: (vehicles: Vehicle[], cnhs: CNH[]) => void;
  toast: (msg: string) => void;
};

export function BackupSection({ vehicles, cnhs, onImport, toast }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [shareBusy, setShareBusy] = useState(false);

  const exportJson = () => {
    const payload = buildBackup(vehicles, cnhs);
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consulta-car-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Backup baixado.');
  };

  const shareBackup = async () => {
    const payload = buildBackup(vehicles, cnhs);
    const filename = `consulta-car-backup-${new Date().toISOString().slice(0, 10)}.json`;
    const summaryText = buildBackupShareSummaryText(vehicles, cnhs, OFFICIAL_SERVICE_LINKS);

    setShareBusy(true);
    try {
      const outcome = await shareConsultaCarBackup(payload, filename, summaryText);
      switch (outcome) {
        case 'shared-file':
          toast('Backup enviado para o app de compartilhamento.');
          break;
        case 'shared-text':
          toast('Resumo enviado. Use Exportar JSON para o arquivo completo.');
          break;
        case 'cancelled':
          break;
        case 'unsupported':
          toast('Compartilhar não está disponível aqui. Use Exportar JSON.');
          break;
        case 'failed':
          toast('Não foi possível compartilhar. Tente Exportar JSON.');
          break;
        default:
          break;
      }
    } finally {
      setShareBusy(false);
    }
  };

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      const { vehicles: v, cnhs: c } = parseBackupJson(text);
      const ok = window.confirm(
        'Substituir todos os dados atuais pelos do arquivo? Esta ação não pode ser desfeita.',
      );
      if (!ok) return;
      onImport(v, c);
      toast('Dados restaurados a partir do backup.');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Falha ao importar.');
    }
  };

  return (
    <div className="border-t border-ink/8 pt-8 mt-8">
      <h4 className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-4">Backup dos dados</h4>
      <p className="text-sm text-muted mb-4 leading-relaxed">
        Exporte um arquivo JSON, use Compartilhar (onde o navegador permitir) ou importe para restaurar neste
        aparelho.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={exportJson}
          className="inline-flex items-center gap-2 rounded-xl border border-ink/8 bg-canvas px-4 py-3 text-sm font-semibold text-ink transition hover:border-brand/35 hover:bg-brand-soft active:bg-brand-soft"
        >
          <Download size={18} aria-hidden />
          Exportar JSON
        </button>
        <button
          type="button"
          disabled={shareBusy}
          onClick={() => void shareBackup()}
          className="inline-flex items-center gap-2 rounded-xl border border-brand/30 bg-brand-soft/60 px-4 py-3 text-sm font-semibold text-brand-emphasis transition hover:bg-brand-soft disabled:opacity-50"
        >
          <Share2 size={18} aria-hidden />
          {shareBusy ? 'Abrindo…' : 'Compartilhar'}
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-xl border border-ink/8 bg-canvas px-4 py-3 text-sm font-semibold text-ink transition hover:border-brand/35 hover:bg-brand-soft active:bg-brand-soft"
        >
          <Upload size={18} aria-hidden />
          Importar JSON
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={onPickFile} />
      </div>
    </div>
  );
}
