import React, { useState } from 'react';
import { X, Search, FileText, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';
import { useLaudoStore } from '../../stores/laudoStore';
import { ConsultaVeicular } from './ConsultaVeicular';
import { DashboardResultados } from './DashboardResultados';
import { GerarLaudo } from './GerarLaudo';
import { LegalDisclaimer } from '../../components/LegalDisclaimer';
import { LEGAL_TEXTS } from '../../constants/legalTexts';

interface LaudoVeicularProps {
  open: boolean;
  onClose: () => void;
}

type ViewMode = 'consulta' | 'dashboard' | 'laudo';

export function LaudoVeicular({ open, onClose }: LaudoVeicularProps) {
  const { currentConsulta, currentLaudo, clearConsulta, clearLaudo } = useLaudoStore();
  const [viewMode, setViewMode] = useState<ViewMode>('consulta');

  const handleClose = () => {
    // Não limpar dados ao fechar, manter para consultas futuras
    onClose();
  };

  const handleNewConsulta = () => {
    clearConsulta();
    clearLaudo();
    setViewMode('consulta');
  };

  const handleConsultaSuccess = () => {
    setViewMode('dashboard');
  };

  const handleGerarLaudo = () => {
    setViewMode('laudo');
  };

  const handleLaudoGenerated = () => {
    // Voltar ao dashboard após gerar laudo
    setViewMode('dashboard');
  };

  if (!open) return null;

  const getTitle = () => {
    switch (viewMode) {
      case 'consulta':
        return 'Consulta Veicular';
      case 'dashboard':
        return 'Relatório do Veículo';
      case 'laudo':
        return 'Gerar Laudo Profissional';
      default:
        return 'Laudo Veicular';
    }
  };

  const getDescription = () => {
    switch (viewMode) {
      case 'consulta':
        return 'Consulte o histórico completo do veículo';
      case 'dashboard':
        return `Análise completa - ${currentConsulta?.veiculo.placa}`;
      case 'laudo':
        return 'Configure e baixe seu laudo profissional';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm">
      <div className="w-full max-w-7xl max-h-[95vh] bg-surface rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-ink/8 bg-gradient-to-r from-brand-soft/30 to-surface">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-white shadow-lg">
              <FileText size={24} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-ink">{getTitle()}</h2>
              <p className="text-sm text-muted">{getDescription()}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Navegação entre views */}
            {currentConsulta && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('dashboard')}
                  className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition ${
                    viewMode === 'dashboard'
                      ? 'bg-brand text-white'
                      : 'text-muted hover:text-ink hover:bg-canvas'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setViewMode('laudo')}
                  className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition ${
                    viewMode === 'laudo'
                      ? 'bg-brand text-white'
                      : 'text-muted hover:text-ink hover:bg-canvas'
                  }`}
                >
                  Laudo
                </button>
                <button
                  onClick={handleNewConsulta}
                  className="px-3 py-1.5 text-sm font-semibold text-brand border border-brand rounded-lg hover:bg-brand-soft/30 transition"
                >
                  Nova Consulta
                </button>
              </div>
            )}
            
            <button
              onClick={handleClose}
              className="rounded-lg p-2 text-muted hover:bg-canvas hover:text-ink transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-safe-nav">
          {viewMode === 'consulta' && (
            <ConsultaVeicular onSuccess={handleConsultaSuccess} />
          )}
          
          {viewMode === 'dashboard' && currentConsulta && (
            <DashboardResultados 
              consulta={currentConsulta}
              onGerarLaudo={handleGerarLaudo}
            />
          )}
          
          {viewMode === 'laudo' && currentConsulta && (
            <GerarLaudo 
              consulta={currentConsulta}
              onLaudoGenerated={handleLaudoGenerated}
            />
          )}
        </div>

        {/* Footer com disclaimer */}
        {viewMode === 'consulta' && (
          <div className="p-3 border-t border-ink/8 bg-canvas/30">
            <div className="flex items-start gap-2 text-xs text-muted">
              <AlertTriangle size={12} className="mt-0.5 shrink-0" />
              <p className="leading-relaxed">
                Este laudo é informativo. Recomendamos vistoria presencial e confirmação em órgãos oficiais.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}