import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Shield, 
  Download, 
  CheckCircle2, 
  AlertTriangle,
  ExternalLink,
  Users,
  DollarSign,
  FileText,
  ArrowRight,
  Info,
  Zap
} from 'lucide-react';
import { useCDTSNEStore } from '../../stores/cdtSneStore';
import { CDTSNEWizard } from './CDTSNEWizard';
import { MultasImportadas } from './MultasImportadas';
import { RealInfratorForm } from './RealInfratorForm';
import { LegalDisclaimer } from '../../components/LegalDisclaimer';

interface CDTSNEHubProps {
  open: boolean;
  onClose: () => void;
}

type ViewMode = 'hub' | 'wizard' | 'multas' | 'real-infrator';

export function CDTSNEHub({ open, onClose }: CDTSNEHubProps) {
  const { 
    cdtStatus, 
    sneStatus, 
    multasImportadas, 
    wizardCompleted,
    resetWizard 
  } = useCDTSNEStore();
  
  const [viewMode, setViewMode] = useState<ViewMode>('hub');

  const handleClose = () => {
    setViewMode('hub');
    onClose();
  };

  const handleStartWizard = () => {
    resetWizard();
    setViewMode('wizard');
  };

  const handleWizardComplete = () => {
    setViewMode('hub');
  };

  if (!open) return null;

  const getTitle = () => {
    switch (viewMode) {
      case 'wizard':
        return 'Configuração CDT + SNE';
      case 'multas':
        return 'Minhas Multas Importadas';
      case 'real-infrator':
        return 'Indicar Real Infrator';
      default:
        return 'CDT + SNE Digital';
    }
  };

  const getDescription = () => {
    switch (viewMode) {
      case 'wizard':
        return 'Siga o passo a passo para ativar todos os benefícios';
      case 'multas':
        return 'Multas importadas do gov.br com desconto SNE';
      case 'real-infrator':
        return 'Indique quem realmente cometeu a infração';
      default:
        return 'Ative a Carteira Digital e ganhe até 40% de desconto em multas';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm">
      <div className="w-full max-w-6xl max-h-[95vh] bg-surface rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-ink/8 bg-gradient-to-r from-green-50 to-surface">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-green-600 text-white shadow-lg shrink-0">
              <Smartphone size={20} md:size={24} strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg md:text-xl font-bold text-ink truncate">{getTitle()}</h2>
              <p className="text-xs md:text-sm text-muted truncate">{getDescription()}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {viewMode !== 'hub' && (
              <button
                onClick={() => setViewMode('hub')}
                className="hidden md:inline-flex px-3 py-1.5 text-sm font-semibold text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition"
              >
                Voltar ao Hub
              </button>
            )}
            {viewMode !== 'hub' && (
              <button
                onClick={() => setViewMode('hub')}
                className="md:hidden inline-flex p-2 text-green-600 rounded-lg hover:bg-green-50 transition"
                title="Voltar ao Hub"
              >
                <ArrowRight className="rotate-180" size={20} />
              </button>
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
          {viewMode === 'hub' && (
            <HubContent 
              cdtStatus={cdtStatus}
              sneStatus={sneStatus}
              multasImportadas={multasImportadas}
              wizardCompleted={wizardCompleted}
              onStartWizard={handleStartWizard}
              onViewMultas={() => setViewMode('multas')}
              onViewRealInfrator={() => setViewMode('real-infrator')}
            />
          )}
          
          {viewMode === 'wizard' && (
            <CDTSNEWizard onComplete={handleWizardComplete} />
          )}
          
          {viewMode === 'multas' && (
            <MultasImportadas />
          )}
          
          {viewMode === 'real-infrator' && (
            <RealInfratorForm onBack={() => setViewMode('hub')} />
          )}
        </div>
      </div>
    </div>
  );
}

function HubContent({ 
  cdtStatus, 
  sneStatus, 
  multasImportadas, 
  wizardCompleted,
  onStartWizard,
  onViewMultas,
  onViewRealInfrator
}: {
  cdtStatus: any;
  sneStatus: any;
  multasImportadas: any[];
  wizardCompleted: boolean;
  onStartWizard: () => void;
  onViewMultas: () => void;
  onViewRealInfrator: () => void;
}) {
  const isFullyConfigured = cdtStatus.isActivated && cdtStatus.govBrConnected && sneStatus.isSubscribed;
  
  return (
    <div className="p-8 space-y-8">
      {/* Status Overview */}
      <div className="text-center">
        <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl ${
          isFullyConfigured 
            ? 'bg-green-100 text-green-600' 
            : 'bg-amber-100 text-amber-600'
        } shadow-lg`}>
          {isFullyConfigured ? (
            <CheckCircle2 size={40} strokeWidth={2} />
          ) : (
            <AlertTriangle size={40} strokeWidth={2} />
          )}
        </div>
        
        <h3 className="text-2xl font-bold text-ink mb-2">
          {isFullyConfigured 
            ? 'Tudo Configurado!' 
            : 'Configure sua Carteira Digital'
          }
        </h3>
        
        <p className="text-muted max-w-2xl mx-auto leading-relaxed">
          {isFullyConfigured
            ? 'Sua CDT está ativa e você tem direito a 40% de desconto em multas através do SNE.'
            : 'Ative a Carteira Digital de Trânsito e o SNE para economizar até 40% em multas.'
          }
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatusCard
          icon={<Smartphone size={24} className="text-blue-600" />}
          title="Carteira Digital (CDT)"
          status={cdtStatus.isActivated ? 'Ativada' : 'Não ativada'}
          isActive={cdtStatus.isActivated}
          description={cdtStatus.isActivated 
            ? 'CDT ativa e sincronizada' 
            : 'Ative para acessar seus documentos digitalmente'
          }
        />
        
        <StatusCard
          icon={<Shield size={24} className="text-green-600" />}
          title="gov.br Conectado"
          status={cdtStatus.govBrConnected ? 'Conectado' : 'Não conectado'}
          isActive={cdtStatus.govBrConnected}
          description={cdtStatus.govBrConnected 
            ? 'Acesso aos serviços gov.br ativo' 
            : 'Conecte para importar dados oficiais'
          }
        />
        
        <StatusCard
          icon={<Zap size={24} className="text-purple-600" />}
          title="SNE Ativo"
          status={sneStatus.isSubscribed ? `${sneStatus.vehiclesSubscribed.length} veículo(s)` : 'Não ativo'}
          isActive={sneStatus.isSubscribed}
          description={sneStatus.isSubscribed 
            ? `Economia de R$ ${sneStatus.estimatedSavings.toFixed(2)}` 
            : 'Ative para 40% de desconto em multas'
          }
        />
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {!isFullyConfigured && (
          <ActionCard
            icon={<ArrowRight size={24} className="text-white" />}
            title="Configurar Tudo"
            description="Siga nosso guia passo a passo para ativar CDT, conectar gov.br e aderir ao SNE"
            buttonText="Começar Configuração"
            buttonColor="bg-green-600 hover:bg-green-700"
            onClick={onStartWizard}
            highlight="Recomendado"
          />
        )}
        
        <ActionCard
          icon={<Download size={24} className="text-white" />}
          title="Importar Minhas Multas"
          description="Importe suas multas do gov.br e veja automaticamente os descontos disponíveis"
          buttonText={`Ver Multas (${multasImportadas.length})`}
          buttonColor="bg-blue-600 hover:bg-blue-700"
          onClick={onViewMultas}
          disabled={!cdtStatus.govBrConnected}
        />
        
        <ActionCard
          icon={<Users size={24} className="text-white" />}
          title="Indicar Real Infrator"
          description="Se você não era o condutor, indique quem realmente cometeu a infração"
          buttonText="Fazer Indicação"
          buttonColor="bg-purple-600 hover:bg-purple-700"
          onClick={onViewRealInfrator}
          disabled={!cdtStatus.govBrConnected}
        />
        
        {isFullyConfigured && (
          <ActionCard
            icon={<FileText size={24} className="text-white" />}
            title="Gerar Recurso com IA"
            description="Use nossa IA para gerar recursos automáticos para suas multas importadas"
            buttonText="Abrir Assistente"
            buttonColor="bg-brand hover:bg-brand-emphasis"
            onClick={() => {
              // Integração com o Assistente de Recurso (Etapa 3)
              window.dispatchEvent(new CustomEvent('openRecursoWizard'));
            }}
          />
        )}
      </div>

      {/* Benefits Section */}
      {isFullyConfigured && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
          <h4 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
            <DollarSign size={20} />
            Seus Benefícios Ativos
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <BenefitItem
              title="40% de Desconto"
              description="Em todas as multas dos veículos no SNE"
              value={`R$ ${sneStatus.estimatedSavings.toFixed(2)} economizados`}
            />
            
            <BenefitItem
              title="Notificação Digital"
              description="Receba multas por email instantaneamente"
              value="Sem atraso nas notificações"
            />
            
            <BenefitItem
              title="Documentos Digitais"
              description="CNH e CRLV sempre no celular"
              value="Praticidade total"
            />
          </div>
        </div>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoCard
          title="O que é a CDT?"
          items={[
            'Carteira Digital de Trânsito oficial do governo',
            'CNH e CRLV válidos digitalmente',
            'Acesso a serviços do DENATRAN',
            'Gratuito e seguro'
          ]}
        />
        
        <InfoCard
          title="Vantagens do SNE"
          items={[
            '40% de desconto no pagamento de multas',
            'Notificação por email em tempo real',
            'Prazo maior para contestação',
            'Histórico completo de infrações'
          ]}
        />
      </div>

      {/* Legal Disclaimer */}
      <LegalDisclaimer
        type="info"
        title="Informações Importantes"
        content="O Consulta Car orienta você no processo de ativação da CDT e SNE, mas o login e configuração são feitos diretamente nos portais oficiais do governo. Não armazenamos suas credenciais gov.br. Todos os links direcionam para sites oficiais (.gov.br)."
      />
    </div>
  );
}

function StatusCard({ 
  icon, 
  title, 
  status, 
  isActive, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  status: string; 
  isActive: boolean; 
  description: string; 
}) {
  return (
    <div className={`p-6 rounded-2xl border ${
      isActive 
        ? 'bg-green-50 border-green-200' 
        : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <h4 className="font-semibold text-ink">{title}</h4>
      </div>
      
      <div className="flex items-center gap-2 mb-2">
        {isActive ? (
          <CheckCircle2 size={16} className="text-green-600" />
        ) : (
          <AlertTriangle size={16} className="text-gray-500" />
        )}
        <span className={`font-semibold ${
          isActive ? 'text-green-800' : 'text-gray-600'
        }`}>
          {status}
        </span>
      </div>
      
      <p className="text-sm text-muted">{description}</p>
    </div>
  );
}

function ActionCard({ 
  icon, 
  title, 
  description, 
  buttonText, 
  buttonColor, 
  onClick, 
  disabled = false,
  highlight 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  buttonText: string; 
  buttonColor: string; 
  onClick: () => void; 
  disabled?: boolean;
  highlight?: string;
}) {
  return (
    <div className="relative p-6 bg-surface border border-ink/8 rounded-2xl hover:border-brand/25 hover:shadow-lg transition">
      {highlight && (
        <div className="absolute -top-2 left-4">
          <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
            {highlight}
          </span>
        </div>
      )}
      
      <h4 className="text-lg font-semibold text-ink mb-2">{title}</h4>
      <p className="text-muted text-sm leading-relaxed mb-4">{description}</p>
      
      <button
        onClick={onClick}
        disabled={disabled}
        className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-white transition ${buttonColor} ${
          disabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:shadow-lg active:scale-[0.98]'
        }`}
      >
        {icon}
        {buttonText}
      </button>
      
      {disabled && (
        <p className="text-xs text-muted mt-2 flex items-center gap-1">
          <Info size={12} />
          Conecte ao gov.br primeiro
        </p>
      )}
    </div>
  );
}

function BenefitItem({ 
  title, 
  description, 
  value 
}: { 
  title: string; 
  description: string; 
  value: string; 
}) {
  return (
    <div className="text-center">
      <h5 className="font-semibold text-green-800 mb-1">{title}</h5>
      <p className="text-sm text-green-600 mb-2">{description}</p>
      <p className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">
        {value}
      </p>
    </div>
  );
}

function InfoCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="p-6 bg-canvas/50 border border-ink/8 rounded-2xl">
      <h4 className="text-lg font-semibold text-ink mb-4">{title}</h4>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-3 text-sm text-muted">
            <CheckCircle2 size={16} className="text-green-600 mt-0.5 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}