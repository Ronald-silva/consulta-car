import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  ExternalLink, 
  Smartphone, 
  Shield, 
  Zap, 
  Download,
  AlertTriangle,
  Info,
  Play,
  Loader2
} from 'lucide-react';
import { useCDTSNEStore } from '../../stores/cdtSneStore';
import { openGovBrUrl, authenticateGovBr, subscribeToSNE, importMultasFromGovBr } from '../../services/govIntegrationService';

interface CDTSNEWizardProps {
  onComplete: () => void;
}

const WIZARD_STEPS = [
  {
    id: 1,
    title: 'Ativar CDT',
    description: 'Baixe e configure a Carteira Digital de Trânsito',
    icon: Smartphone,
  },
  {
    id: 2,
    title: 'Conectar gov.br',
    description: 'Faça login com sua conta gov.br',
    icon: Shield,
  },
  {
    id: 3,
    title: 'Aderir ao SNE',
    description: 'Ative o Sistema de Notificação Eletrônica',
    icon: Zap,
  },
  {
    id: 4,
    title: 'Importar Multas',
    description: 'Importe suas multas e veja os descontos',
    icon: Download,
  },
  {
    id: 5,
    title: 'Concluído',
    description: 'Tudo configurado com sucesso!',
    icon: CheckCircle2,
  },
];

export function CDTSNEWizard({ onComplete }: CDTSNEWizardProps) {
  const { 
    currentStep, 
    cdtStatus, 
    sneStatus,
    isLoading,
    error,
    nextStep, 
    prevStep, 
    setCDTActivated,
    setGovBrConnected,
    setSNESubscribed,
    importMultas,
    completeWizard,
    setLoading,
    setError,
    clearError
  } = useCDTSNEStore();

  const [stepCompleted, setStepCompleted] = useState<Record<number, boolean>>({
    1: cdtStatus.isActivated,
    2: cdtStatus.govBrConnected,
    3: sneStatus.isSubscribed,
    4: false,
    5: false,
  });

  const handleStepComplete = (step: number) => {
    setStepCompleted(prev => ({ ...prev, [step]: true }));
    
    // Auto-advance to next step
    if (step < 5) {
      setTimeout(() => {
        nextStep();
      }, 1000);
    } else {
      completeWizard();
      setTimeout(() => {
        onComplete();
      }, 2000);
    }
  };

  const handleCDTActivation = () => {
    setCDTActivated(true);
    handleStepComplete(1);
  };

  const handleGovBrConnection = async () => {
    setLoading(true);
    clearError();
    
    try {
      const result = await authenticateGovBr();
      
      if (result.success) {
        setGovBrConnected(true);
        handleStepComplete(2);
      } else {
        setError(result.error || 'Erro na autenticação');
      }
    } catch (err) {
      setError('Erro ao conectar com gov.br');
    } finally {
      setLoading(false);
    }
  };

  const handleSNESubscription = async () => {
    setLoading(true);
    clearError();
    
    try {
      // Simular veículos do usuário
      const vehiculos = ['ABC1234', 'XYZ5678'];
      const result = await subscribeToSNE('mock_token', vehiculos);
      
      if (result.success) {
        setSNESubscribed(true, result.vehiclesSubscribed);
        handleStepComplete(3);
      } else {
        setError('Erro ao aderir ao SNE');
      }
    } catch (err) {
      setError('Erro ao aderir ao SNE');
    } finally {
      setLoading(false);
    }
  };

  const handleImportMultas = async () => {
    setLoading(true);
    clearError();
    
    try {
      await importMultas();
      handleStepComplete(4);
    } catch (err) {
      setError('Erro ao importar multas');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = (step: number): boolean => {
    switch (step) {
      case 1:
        return stepCompleted[1];
      case 2:
        return stepCompleted[1] && stepCompleted[2];
      case 3:
        return stepCompleted[1] && stepCompleted[2] && stepCompleted[3];
      case 4:
        return stepCompleted[1] && stepCompleted[2] && stepCompleted[3];
      default:
        return true;
    }
  };

  return (
    <div className="p-4 md:p-8 pb-safe-nav">
      {/* Progress Bar */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          {WIZARD_STEPS.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center flex-1">
                <div className={`flex h-9 w-9 md:h-12 md:w-12 items-center justify-center rounded-full border-2 transition ${
                  currentStep === step.id
                    ? 'border-green-600 bg-green-600 text-white'
                    : stepCompleted[step.id]
                    ? 'border-green-600 bg-green-600 text-white'
                    : currentStep > step.id
                    ? 'border-green-600 bg-green-600 text-white'
                    : 'border-gray-300 bg-gray-100 text-gray-400'
                }`}>
                  {stepCompleted[step.id] ? (
                    <CheckCircle2 size={16} md:size={20} />
                  ) : (
                    <step.icon size={16} md:size={20} />
                  )}
                </div>
                <span className={`hidden md:block mt-2 text-xs font-semibold ${
                  currentStep >= step.id ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {step.title}
                </span>
              </div>
              
              {index < WIZARD_STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 md:mx-4 ${
                  stepCompleted[step.id] ? 'bg-green-600' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
        
        <div className="text-center">
          <h3 className="text-lg md:text-xl font-bold text-ink mb-1">
            Passo {currentStep}: {WIZARD_STEPS[currentStep - 1]?.title}
          </h3>
          <p className="text-sm md:text-base text-muted">
            {WIZARD_STEPS[currentStep - 1]?.description}
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 md:mb-6 p-3 md:p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-600" />
            <p className="text-red-800 font-semibold">Erro</p>
          </div>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Step Content */}
      <div className="max-w-3xl mx-auto">
        {currentStep === 1 && (
          <CDTActivationStep 
            onComplete={handleCDTActivation}
            isCompleted={stepCompleted[1]}
            isLoading={isLoading}
          />
        )}
        
        {currentStep === 2 && (
          <GovBrConnectionStep 
            onComplete={handleGovBrConnection}
            isCompleted={stepCompleted[2]}
            isLoading={isLoading}
          />
        )}
        
        {currentStep === 3 && (
          <SNESubscriptionStep 
            onComplete={handleSNESubscription}
            isCompleted={stepCompleted[3]}
            isLoading={isLoading}
          />
        )}
        
        {currentStep === 4 && (
          <ImportMultasStep 
            onComplete={handleImportMultas}
            isCompleted={stepCompleted[4]}
            isLoading={isLoading}
          />
        )}
        
        {currentStep === 5 && (
          <CompletionStep />
        )}
      </div>

      {/* Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-center mt-6 md:mt-8 pt-4 md:pt-6 border-t border-ink/8 gap-4">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-muted hover:text-ink disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={18} />
          Anterior
        </button>
        
        <span className="text-sm text-muted">
          {currentStep} de {WIZARD_STEPS.length}
        </span>
        
        <button
          onClick={nextStep}
          disabled={currentStep === 5 || !canProceed(currentStep)}
          className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Próximo
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

function CDTActivationStep({ 
  onComplete, 
  isCompleted, 
  isLoading,
  key
}: { 
  onComplete: () => void; 
  isCompleted: boolean; 
  isLoading: boolean;
  key?: string | number;
}) {
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-3 md:mb-4 flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
          <Smartphone size={24} md:size={32} />
        </div>
        <h4 className="text-base md:text-lg font-bold text-ink mb-1 md:mb-2">Ativar Carteira Digital de Trânsito</h4>
        <p className="text-xs md:text-sm text-muted">
          A CDT é o app oficial do governo para seus documentos de trânsito
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 md:p-6">
        <h5 className="font-semibold text-blue-800 mb-2 md:mb-3 text-sm md:text-base">📱 Como ativar:</h5>
        <ol className="space-y-2 md:space-y-3 text-xs md:text-sm text-blue-700">
          <li className="flex items-start gap-2 md:gap-3">
            <span className="flex h-5 w-5 md:h-6 md:w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold shrink-0">1</span>
            <div className="min-w-0 flex-1">
              <strong>Baixe o app CDT</strong>
              <p className="text-blue-600">Disponível na Play Store e App Store</p>
            </div>
          </li>
          <li className="flex items-start gap-2 md:gap-3">
            <span className="flex h-5 w-5 md:h-6 md:w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold shrink-0">2</span>
            <div className="min-w-0 flex-1">
              <strong>Faça login com gov.br</strong>
              <p className="text-blue-600">Use sua conta gov.br (CPF + senha)</p>
            </div>
          </li>
          <li className="flex items-start gap-2 md:gap-3">
            <span className="flex h-5 w-5 md:h-6 md:w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold shrink-0">3</span>
            <div className="min-w-0 flex-1">
              <strong>Ative seus documentos</strong>
              <p className="text-blue-600">CNH e CRLV ficarão disponíveis no app</p>
            </div>
          </li>
        </ol>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => openGovBrUrl('cdtApp')}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition text-sm"
        >
          <ExternalLink size={18} md:size={20} />
          Baixar CDT
        </button>
        
        <button
          onClick={onComplete}
          disabled={isCompleted || isLoading}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 border-2 border-green-600 text-green-600 rounded-xl font-semibold hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
        >
          {isLoading ? (
            <Loader2 size={18} md:size={20} className="animate-spin" />
          ) : isCompleted ? (
            <CheckCircle2 size={18} md:size={20} />
          ) : (
            <CheckCircle2 size={18} md:size={20} />
          )}
          {isCompleted ? 'Concluído' : 'Já ativei a CDT'}
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 md:p-4">
        <div className="flex items-start gap-2">
          <Info size={14} md:size={16} className="text-amber-600 mt-0.5 shrink-0" />
          <div className="text-xs md:text-sm text-amber-800">
            <strong>Dica:</strong> Se você já tem o app CDT instalado e ativo, pode pular este passo clicando em "Já ativei a CDT".
          </div>
        </div>
      </div>
    </div>
  );
}

function GovBrConnectionStep({ 
  onComplete, 
  isCompleted, 
  isLoading,
  key
}: { 
  onComplete: () => void; 
  isCompleted: boolean; 
  isLoading: boolean;
  key?: string | number;
}) {
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-3 md:mb-4 flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-2xl bg-green-100 text-green-600">
          <Shield size={24} md:size={32} />
        </div>
        <h4 className="text-base md:text-lg font-bold text-ink mb-1 md:mb-2">Conectar com gov.br</h4>
        <p className="text-xs md:text-sm text-muted">
          Conecte sua conta gov.br para acessar os serviços oficiais
        </p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-xl p-4 md:p-6">
        <h5 className="font-semibold text-green-800 mb-2 md:mb-3 text-sm md:text-base">🔐 Processo seguro:</h5>
        <ul className="space-y-1 md:space-y-2 text-xs md:text-sm text-green-700">
          <li className="flex items-center gap-2">
            <CheckCircle2 size={14} md:size={16} className="text-green-600 shrink-0" />
            <span>Login feito diretamente no site oficial gov.br</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 size={14} md:size={16} className="text-green-600 shrink-0" />
            <span>Consulta Car não armazena sua senha</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 size={14} md:size={16} className="text-green-600 shrink-0" />
            <span>Conexão criptografada e segura</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 size={14} md:size={16} className="text-green-600 shrink-0" />
            <span>Você pode desconectar a qualquer momento</span>
          </li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => openGovBrUrl('login')}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition text-sm"
        >
          <ExternalLink size={18} md:size={20} />
          Abrir gov.br
        </button>
        
        <button
          onClick={onComplete}
          disabled={isCompleted || isLoading}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 border-2 border-green-600 text-green-600 rounded-xl font-semibold hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
        >
          {isLoading ? (
            <Loader2 size={18} md:size={20} className="animate-spin" />
          ) : isCompleted ? (
            <CheckCircle2 size={18} md:size={20} />
          ) : (
            <Play size={18} md:size={20} />
          )}
          {isCompleted ? 'Conectado' : isLoading ? 'Conectando...' : 'Simular Conexão'}
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 md:p-4">
        <div className="flex items-start gap-2">
          <Info size={14} md:size={16} className="text-blue-600 mt-0.5 shrink-0" />
          <div className="text-xs md:text-sm text-blue-800">
            <strong>Para testar:</strong> Clique em "Simular Conexão" para prosseguir com dados de exemplo. 
            Em produção, você faria login real no gov.br.
          </div>
        </div>
      </div>
    </div>
  );
}

function SNESubscriptionStep({ 
  onComplete, 
  isCompleted, 
  isLoading,
  key
}: { 
  onComplete: () => void; 
  isCompleted: boolean; 
  isLoading: boolean;
  key?: string | number;
}) {
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-3 md:mb-4 flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-2xl bg-purple-100 text-purple-600">
          <Zap size={24} md:size={32} />
        </div>
        <h4 className="text-base md:text-lg font-bold text-ink mb-1 md:mb-2">Aderir ao SNE</h4>
        <p className="text-xs md:text-sm text-muted">
          Sistema de Notificação Eletrônica - 40% de desconto em multas!
        </p>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 md:p-6">
        <h5 className="font-semibold text-purple-800 mb-2 md:mb-3 text-sm md:text-base">⚡ Benefícios do SNE:</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs md:text-sm text-purple-700">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} md:size={16} className="text-purple-600 shrink-0" />
            <span><strong>40% de desconto</strong> no pagamento</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} md:size={16} className="text-purple-600 shrink-0" />
            <span><strong>Notificação por email</strong> instantânea</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} md:size={16} className="text-purple-600 shrink-0" />
            <span><strong>Prazo maior</strong> para contestação</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} md:size={16} className="text-purple-600 shrink-0" />
            <span><strong>Histórico completo</strong> de infrações</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 md:p-6">
        <h5 className="font-semibold text-green-800 mb-1 md:mb-2 text-sm md:text-base">💰 Economia Estimada</h5>
        <p className="text-xl md:text-2xl font-bold text-green-700 mb-1">R$ 234,56</p>
        <p className="text-xs md:text-sm text-green-600">
          Baseado em multas típicas de R$ 391,00 → R$ 234,60 com SNE
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => openGovBrUrl('sneAdesao')}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition text-sm"
        >
          <ExternalLink size={18} md:size={20} />
          Abrir Portal SNE
        </button>
        
        <button
          onClick={onComplete}
          disabled={isCompleted || isLoading}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 border-2 border-purple-600 text-purple-600 rounded-xl font-semibold hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
        >
          {isLoading ? (
            <Loader2 size={18} md:size={20} className="animate-spin" />
          ) : isCompleted ? (
            <CheckCircle2 size={18} md:size={20} />
          ) : (
            <Zap size={18} md:size={20} />
          )}
          {isCompleted ? 'SNE Ativo' : isLoading ? 'Aderindo...' : 'Simular Adesão'}
        </button>
      </div>
    </div>
  );
}

function ImportMultasStep({ 
  onComplete, 
  isCompleted, 
  isLoading,
  key
}: { 
  onComplete: () => void; 
  isCompleted: boolean; 
  isLoading: boolean;
  key?: string | number;
}) {
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-3 md:mb-4 flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
          <Download size={24} md:size={32} />
        </div>
        <h4 className="text-base md:text-lg font-bold text-ink mb-1 md:mb-2">Importar Suas Multas</h4>
        <p className="text-xs md:text-sm text-muted">
          Importe suas multas do gov.br e veja os descontos automaticamente
        </p>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 md:p-6">
        <h5 className="font-semibold text-orange-800 mb-2 md:mb-3 text-sm md:text-base">📋 O que será importado:</h5>
        <ul className="space-y-1 md:space-y-2 text-xs md:text-sm text-orange-700">
          <li className="flex items-center gap-2">
            <CheckCircle2 size={14} md:size={16} className="text-orange-600 shrink-0" />
            <span>Todas as multas pendentes dos seus veículos</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 size={14} md:size={16} className="text-orange-600 shrink-0" />
            <span>Valores originais e com desconto SNE</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 size={14} md:size={16} className="text-orange-600 shrink-0" />
            <span>Prazos para pagamento e contestação</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 size={14} md:size={16} className="text-orange-600 shrink-0" />
            <span>Detalhes completos de cada infração</span>
          </li>
        </ul>
      </div>

      <div className="flex justify-center">
        <button
          onClick={onComplete}
          disabled={isCompleted || isLoading}
          className="w-full inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
        >
          {isLoading ? (
            <Loader2 size={20} md:size={24} className="animate-spin" />
          ) : isCompleted ? (
            <CheckCircle2 size={20} md:size={24} />
          ) : (
            <Download size={20} md:size={24} />
          )}
          {isCompleted ? 'Multas Importadas' : isLoading ? 'Importando...' : 'Importar Minhas Multas'}
        </button>
      </div>

      {isLoading && (
        <div className="text-center">
          <p className="text-xs md:text-sm text-muted">
            Buscando suas multas nos órgãos de trânsito...
          </p>
        </div>
      )}
    </div>
  );
}

function CompletionStep({key}: {key?: string | number}) {
  return (
    <div className="text-center space-y-4 md:space-y-6">
      <div className="mx-auto mb-4 md:mb-6 flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-2xl bg-green-100 text-green-600">
        <CheckCircle2 size={32} md:size={40} />
      </div>
      
      <div>
        <h4 className="text-xl md:text-2xl font-bold text-ink mb-1 md:mb-2">🎉 Tudo Configurado!</h4>
        <p className="text-sm md:text-base text-muted">
          Sua CDT está ativa e você já tem direito aos descontos do SNE
        </p>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 md:p-6">
        <h5 className="font-semibold text-green-800 mb-2 md:mb-4 text-sm md:text-base">✅ O que você conquistou:</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs md:text-sm text-green-700">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} md:size={16} className="text-green-600 shrink-0" />
            <span>CDT ativa com documentos digitais</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} md:size={16} className="text-green-600 shrink-0" />
            <span>Conexão segura com gov.br</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} md:size={16} className="text-green-600 shrink-0" />
            <span>SNE ativo com 40% de desconto</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} md:size={16} className="text-green-600 shrink-0" />
            <span>Multas importadas e organizadas</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 md:p-4">
        <div className="flex items-start gap-2">
          <Info size={14} md:size={16} className="text-blue-600 mt-0.5 shrink-0" />
          <div className="text-xs md:text-sm text-blue-800 text-left">
            <strong>Próximos passos:</strong> Agora você pode gerar recursos automáticos com IA, 
            indicar real infrator quando necessário e acompanhar todas suas multas em um só lugar.
          </div>
        </div>
      </div>
    </div>
  );
}