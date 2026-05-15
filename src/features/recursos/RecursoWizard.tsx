import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, FileText, AlertTriangle } from 'lucide-react';
import { useRecursoStore } from '../../stores/recursoStore';
import { LegalDisclaimer } from '../../components/LegalDisclaimer';
import { LEGAL_TEXTS } from '../../constants/legalTexts';

// Steps
import { UploadMultaStep } from './steps/UploadMultaStep';
import { OcrStep } from './steps/OcrStep';
import { InmetroCheckStep } from './steps/InmetroCheckStep';
import { AnaliseIAStep } from './steps/AnaliseIAStep';
import { EditorRecursoStep } from './steps/EditorRecursoStep';
import { GerarPDFStep } from './steps/GerarPDFStep';

interface RecursoWizardProps {
  open: boolean;
  onClose: () => void;
  multaId?: string;
}

const STEPS = [
  { id: 1, title: 'Upload da Multa', description: 'Envie foto ou PDF da multa' },
  { id: 2, title: 'Extração de Dados', description: 'Confirme os dados extraídos' },
  { id: 3, title: 'Verificação Inmetro', description: 'Validação do equipamento' },
  { id: 4, title: 'Análise com IA', description: 'Argumentos jurídicos sugeridos' },
  { id: 5, title: 'Editor do Recurso', description: 'Personalize seu recurso' },
  { id: 6, title: 'Gerar PDF', description: 'Download do documento final' },
];

export function RecursoWizard({ open, onClose, multaId }: RecursoWizardProps) {
  const {
    wizardState,
    currentRecurso,
    initializeRecurso,
    setWizardStep,
    clearRecurso,
    canGoNext,
    canGoPrev,
    saveRecurso,
  } = useRecursoStore();

  useEffect(() => {
    if (open && !currentRecurso) {
      initializeRecurso(multaId);
    }
  }, [open, currentRecurso, multaId, initializeRecurso]);

  const handleClose = () => {
    if (currentRecurso) {
      saveRecurso();
    }
    onClose();
  };

  const handleNext = () => {
    if (canGoNext() && wizardState.currentStep < wizardState.totalSteps) {
      setWizardStep(wizardState.currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (canGoPrev()) {
      setWizardStep(wizardState.currentStep - 1);
    }
  };

  const handleStepClick = (step: number) => {
    // Permitir navegar apenas para steps já visitados ou o próximo
    if (step <= wizardState.currentStep || step === wizardState.currentStep + 1) {
      setWizardStep(step);
    }
  };

  const renderCurrentStep = () => {
    switch (wizardState.currentStep) {
      case 1:
        return <UploadMultaStep />;
      case 2:
        return <OcrStep />;
      case 3:
        return <InmetroCheckStep />;
      case 4:
        return <AnaliseIAStep />;
      case 5:
        return <EditorRecursoStep />;
      case 6:
        return <GerarPDFStep />;
      default:
        return <div>Step não encontrado</div>;
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm">
      <div className="w-full max-w-6xl max-h-[95vh] bg-surface rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-ink/8 bg-gradient-to-r from-brand-soft/30 to-surface">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-brand text-white shadow-lg shrink-0">
              <FileText size={20} md:size={24} strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg md:text-xl font-bold text-ink truncate">Assistente de Recurso com IA</h2>
              <p className="text-xs md:text-sm text-muted truncate">
                {STEPS[wizardState.currentStep - 1]?.description}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-2 text-muted hover:bg-canvas hover:text-ink transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-4 py-3 border-b border-ink/8 bg-canvas/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-ink">
              Etapa {wizardState.currentStep} de {wizardState.totalSteps}
            </span>
            <span className="text-sm text-muted">
              {Math.round((wizardState.currentStep / wizardState.totalSteps) * 100)}% concluído
            </span>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center gap-2">
            {STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => handleStepClick(step.id)}
                  className={`flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full text-xs font-bold transition ${
                    step.id === wizardState.currentStep
                      ? 'bg-brand text-white shadow-lg'
                      : step.id < wizardState.currentStep
                      ? 'bg-green-500 text-white cursor-pointer hover:bg-green-600'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={step.id > wizardState.currentStep + 1}
                >
                  {step.id < wizardState.currentStep ? '✓' : step.id}
                </button>
                
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-1 rounded transition ${
                      step.id < wizardState.currentStep
                        ? 'bg-green-500'
                        : step.id === wizardState.currentStep
                        ? 'bg-brand'
                        : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step Titles (only on large desktop) */}
          <div className="hidden lg:flex justify-between mt-2">
            {STEPS.map((step) => (
              <div key={step.id} className="flex-1 text-center">
                <p className={`text-xs font-medium ${
                  step.id === wizardState.currentStep
                    ? 'text-brand'
                    : step.id < wizardState.currentStep
                    ? 'text-green-600'
                    : 'text-muted'
                }`}>
                  {step.title}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-safe-nav">
          {wizardState.error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} />
                <span className="font-semibold">Erro:</span>
              </div>
              <p className="mt-1 text-sm">{wizardState.error}</p>
            </div>
          )}

          {renderCurrentStep()}
        </div>

        {/* Footer */}
        <div className="flex flex-col md:flex-row items-center justify-between p-4 md:p-6 border-t border-ink/8 bg-canvas/30 gap-4">
          <div className="flex-1 w-full">
            {wizardState.currentStep === 1 && (
              <LegalDisclaimer
                type="warning"
                title="Aviso Jurídico"
                content={LEGAL_TEXTS.recursoDisclaimer}
                collapsible
                className="max-w-md"
              />
            )}
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={handlePrev}
              disabled={!canGoPrev() || wizardState.isLoading}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-muted border border-ink/20 rounded-lg hover:bg-canvas hover:text-ink disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={16} />
              Anterior
            </button>

            {wizardState.currentStep < wizardState.totalSteps ? (
              <button
                onClick={handleNext}
                disabled={!canGoNext() || wizardState.isLoading}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2 text-sm font-semibold text-white bg-brand rounded-lg hover:bg-brand-emphasis disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Próximo
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleClose}
                className="flex-1 md:flex-none px-4 md:px-6 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition"
              >
                Finalizar
              </button>
            )}
          </div>
        </div>

        {/* Loading Overlay */}
        {wizardState.isLoading && (
          <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-semibold text-ink">Processando...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}