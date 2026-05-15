import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle,
  CheckCircle2,
  Gavel,
  Download,
  BarChart3,
  PieChart,
  Target,
  Zap,
  Clock,
  Shield,
  FileText,
  ArrowRight,
  Info,
  Loader2
} from 'lucide-react';
import { useCalculadoraStore, type MultaCalculadora, type CenarioEconomia } from '../../stores/calculadoraStore';
import { SimuladorComparativo } from './SimuladorComparativo';
import { DashboardEconomia } from './DashboardEconomia';
import { RelatorioEconomia } from './RelatorioEconomia';
import { LegalDisclaimer } from '../../components/LegalDisclaimer';

interface CalculadoraEconomiaProps {
  open: boolean;
  onClose: () => void;
}

type ViewMode = 'dashboard' | 'simulador' | 'relatorio';

export function CalculadoraEconomia({ open, onClose }: CalculadoraEconomiaProps) {
  const { 
    multaSelecionada,
    cenarios,
    calculosRealizados,
    resumoEconomia,
    isCalculating,
    error,
    selecionarMulta,
    importarMultasSNE,
    clearError
  } = useCalculadoraStore();

  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [multaPersonalizada, setMultaPersonalizada] = useState<Partial<MultaCalculadora>>({
    valorOriginal: 195.23,
    descricao: 'Excesso de velocidade em até 20%',
    pontos: 4,
    orgaoAutuador: 'DETRAN-SP',
    placa: 'ABC1234'
  });

  useEffect(() => {
    if (open && calculosRealizados.length === 0) {
      // Importar multas automaticamente na primeira abertura
      importarMultasSNE();
    }
  }, [open, calculosRealizados.length, importarMultasSNE]);

  const handleClose = () => {
    clearError();
    onClose();
  };

  const handleCalcularPersonalizada = () => {
    if (!multaPersonalizada.valorOriginal || !multaPersonalizada.descricao) {
      return;
    }

    const multa: MultaCalculadora = {
      id: `personalizada-${Date.now()}`,
      numeroAuto: 'SIMULACAO',
      placa: multaPersonalizada.placa || 'ABC1234',
      valorOriginal: multaPersonalizada.valorOriginal,
      valorComDescontoSNE: multaPersonalizada.valorOriginal * 0.6,
      descricao: multaPersonalizada.descricao,
      dataInfracao: new Date().toISOString().split('T')[0],
      orgaoAutuador: multaPersonalizada.orgaoAutuador || 'DETRAN-SP',
      pontos: multaPersonalizada.pontos || 4,
      temDescontoSNE: true,
      chanceSuccessoRecurso: 0,
      valorComJuros: 0,
      pontosEvitados: 0
    };

    selecionarMulta(multa);
    setViewMode('simulador');
  };

  const handleGerarRecurso = (multa: MultaCalculadora) => {
    // Integração com Assistente de Recurso (Etapa 3)
    const recursoData = {
      numeroAuto: multa.numeroAuto,
      placa: multa.placa,
      valor: multa.valorOriginal,
      dataInfracao: multa.dataInfracao,
      descricao: multa.descricao,
      orgaoAutuador: multa.orgaoAutuador,
    };
    
    window.dispatchEvent(new CustomEvent('openRecursoWizard', { 
      detail: recursoData 
    }));
    
    handleClose();
  };

  if (!open) return null;

  const getTitle = () => {
    switch (viewMode) {
      case 'simulador':
        return 'Simulador de Economia';
      case 'relatorio':
        return 'Relatório de Economia';
      default:
        return 'Calculadora de Economia';
    }
  };

  const getDescription = () => {
    switch (viewMode) {
      case 'simulador':
        return 'Compare cenários e escolha a melhor estratégia';
      case 'relatorio':
        return 'Relatório completo de economia em PDF';
      default:
        return 'Descubra quanto você pode economizar em multas';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm">
      <div className="w-full max-w-7xl max-h-[95vh] bg-surface rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-ink/8 bg-gradient-to-r from-green-50 to-surface">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-600 text-white shadow-lg">
              <Calculator size={24} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-ink">{getTitle()}</h2>
              <p className="text-sm text-muted">{getDescription()}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Navegação entre views */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('dashboard')}
                className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition ${
                  viewMode === 'dashboard'
                    ? 'bg-green-600 text-white'
                    : 'text-muted hover:text-ink hover:bg-canvas'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setViewMode('simulador')}
                className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition ${
                  viewMode === 'simulador'
                    ? 'bg-green-600 text-white'
                    : 'text-muted hover:text-ink hover:bg-canvas'
                }`}
              >
                Simulador
              </button>
              <button
                onClick={() => setViewMode('relatorio')}
                className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition ${
                  viewMode === 'relatorio'
                    ? 'bg-green-600 text-white'
                    : 'text-muted hover:text-ink hover:bg-canvas'
                }`}
              >
                Relatório
              </button>
            </div>
            
            <button
              onClick={handleClose}
              className="rounded-lg p-2 text-muted hover:bg-canvas hover:text-ink transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-2">
              <AlertTriangle size={20} className="text-red-600" />
              <p className="text-red-800 font-semibold">Erro</p>
            </div>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-safe-nav">
          {viewMode === 'dashboard' && (
            <DashboardContent 
              resumoEconomia={resumoEconomia}
              calculosRealizados={calculosRealizados}
              multaPersonalizada={multaPersonalizada}
              setMultaPersonalizada={setMultaPersonalizada}
              onCalcularPersonalizada={handleCalcularPersonalizada}
              onSelecionarMulta={(multa) => {
                selecionarMulta(multa);
                setViewMode('simulador');
              }}
              onImportarMultas={importarMultasSNE}
              isLoading={isCalculating}
            />
          )}
          
          {viewMode === 'simulador' && (
            <SimuladorComparativo 
              multa={multaSelecionada}
              cenarios={cenarios}
              isCalculating={isCalculating}
              onGerarRecurso={handleGerarRecurso}
              onVoltar={() => setViewMode('dashboard')}
            />
          )}
          
          {viewMode === 'relatorio' && (
            <RelatorioEconomia 
              multas={calculosRealizados}
              onVoltar={() => setViewMode('dashboard')}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function DashboardContent({ 
  resumoEconomia, 
  calculosRealizados, 
  multaPersonalizada,
  setMultaPersonalizada,
  onCalcularPersonalizada,
  onSelecionarMulta,
  onImportarMultas,
  isLoading
}: {
  resumoEconomia: any;
  calculosRealizados: MultaCalculadora[];
  multaPersonalizada: Partial<MultaCalculadora>;
  setMultaPersonalizada: (multa: Partial<MultaCalculadora>) => void;
  onCalcularPersonalizada: () => void;
  onSelecionarMulta: (multa: MultaCalculadora) => void;
  onImportarMultas: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="p-8 space-y-8">
      {/* Hero Section */}
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-green-100 text-green-600 shadow-lg">
          <TrendingUp size={40} strokeWidth={2} />
        </div>
        <h3 className="text-2xl font-bold text-ink mb-3">Calculadora de Economia Inteligente</h3>
        <p className="text-muted max-w-2xl mx-auto leading-relaxed">
          Descubra exatamente quanto você pode economizar em cada multa comparando todas as opções disponíveis.
        </p>
      </div>

      {/* Resumo Geral */}
      {resumoEconomia.totalMultas > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
          <h4 className="text-xl font-bold text-green-800 mb-6 text-center flex items-center justify-center gap-2">
            <Target size={24} />
            Seu Potencial de Economia
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <ResumoCard
              icon={<FileText size={24} className="text-blue-600" />}
              title="Total de Multas"
              value={resumoEconomia.totalMultas.toString()}
              subtitle="Analisadas"
              color="blue"
            />
            
            <ResumoCard
              icon={<DollarSign size={24} className="text-red-600" />}
              title="Valor Total"
              value={`R$ ${resumoEconomia.valorTotal.toFixed(2)}`}
              subtitle="Sem estratégia"
              color="red"
            />
            
            <ResumoCard
              icon={<TrendingUp size={24} className="text-green-600" />}
              title="Economia Máxima"
              value={`R$ ${resumoEconomia.economiaMaxima.toFixed(2)}`}
              subtitle="Com melhor estratégia"
              color="green"
            />
            
            <ResumoCard
              icon={<Shield size={24} className="text-purple-600" />}
              title="Pontos em Risco"
              value={resumoEconomia.pontosRisco.toString()}
              subtitle="Na sua CNH"
              color="purple"
            />
          </div>
          
          {resumoEconomia.economiaMaxima > 0 && (
            <div className="mt-6 text-center">
              <p className="text-2xl font-bold text-green-700">
                Você pode economizar até {((resumoEconomia.economiaMaxima / resumoEconomia.valorTotal) * 100).toFixed(1)}%
              </p>
              <p className="text-green-600 text-sm mt-1">
                Isso representa R$ {resumoEconomia.economiaMaxima.toFixed(2)} no seu bolso!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Calculadora Rápida */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-surface border border-ink/8 rounded-2xl p-6">
          <h4 className="text-lg font-semibold text-ink mb-4 flex items-center gap-2">
            <Calculator size={20} />
            Calculadora Rápida
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">
                Valor da Multa (R$)
              </label>
              <input
                type="number"
                value={multaPersonalizada.valorOriginal || ''}
                onChange={(e) => setMultaPersonalizada({
                  ...multaPersonalizada,
                  valorOriginal: Number(e.target.value)
                })}
                placeholder="195.23"
                className="w-full px-4 py-3 border border-ink/8 rounded-xl bg-surface focus:border-green-600 focus:ring-1 focus:ring-green-600/20 outline-none transition"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">
                Descrição da Infração
              </label>
              <input
                type="text"
                value={multaPersonalizada.descricao || ''}
                onChange={(e) => setMultaPersonalizada({
                  ...multaPersonalizada,
                  descricao: e.target.value
                })}
                placeholder="Ex: Excesso de velocidade em até 20%"
                className="w-full px-4 py-3 border border-ink/8 rounded-xl bg-surface focus:border-green-600 focus:ring-1 focus:ring-green-600/20 outline-none transition"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  Pontos CNH
                </label>
                <select
                  value={multaPersonalizada.pontos || 4}
                  onChange={(e) => setMultaPersonalizada({
                    ...multaPersonalizada,
                    pontos: Number(e.target.value)
                  })}
                  className="w-full px-4 py-3 border border-ink/8 rounded-xl bg-surface focus:border-green-600 focus:ring-1 focus:ring-green-600/20 outline-none"
                >
                  <option value={3}>3 pontos (Leve)</option>
                  <option value={4}>4 pontos (Média)</option>
                  <option value={5}>5 pontos (Grave)</option>
                  <option value={7}>7 pontos (Gravíssima)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  Órgão
                </label>
                <select
                  value={multaPersonalizada.orgaoAutuador || 'DETRAN-SP'}
                  onChange={(e) => setMultaPersonalizada({
                    ...multaPersonalizada,
                    orgaoAutuador: e.target.value
                  })}
                  className="w-full px-4 py-3 border border-ink/8 rounded-xl bg-surface focus:border-green-600 focus:ring-1 focus:ring-green-600/20 outline-none"
                >
                  <option value="DETRAN-SP">DETRAN-SP</option>
                  <option value="CET-SP">CET-SP</option>
                  <option value="PRF">PRF</option>
                  <option value="DETRAN-RJ">DETRAN-RJ</option>
                </select>
              </div>
            </div>
            
            <button
              onClick={onCalcularPersonalizada}
              disabled={!multaPersonalizada.valorOriginal || !multaPersonalizada.descricao}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <Calculator size={20} />
              Calcular Economia
            </button>
          </div>
        </div>

        {/* Suas Multas */}
        <div className="bg-surface border border-ink/8 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-ink flex items-center gap-2">
              <FileText size={20} />
              Suas Multas ({calculosRealizados.length})
            </h4>
            
            <button
              onClick={onImportarMultas}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-green-600 border border-green-600 rounded-lg hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              {isLoading ? 'Importando...' : 'Importar do SNE'}
            </button>
          </div>
          
          {calculosRealizados.length === 0 ? (
            <div className="text-center py-8">
              <FileText size={32} className="text-muted mx-auto mb-2" />
              <p className="text-muted mb-4">Nenhuma multa importada ainda</p>
              <button
                onClick={onImportarMultas}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Download size={16} />
                )}
                Importar Multas
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {calculosRealizados.slice(0, 5).map((multa) => (
                <MultaCard
                  key={multa.id}
                  multa={multa}
                  onClick={() => onSelecionarMulta(multa)}
                />
              ))}
              
              {calculosRealizados.length > 5 && (
                <p className="text-sm text-muted text-center py-2">
                  +{calculosRealizados.length - 5} multa(s) adicional(is)
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dicas de Economia */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DicaCard
          icon={<Zap size={24} className="text-yellow-600" />}
          title="SNE Automático"
          description="Com o SNE ativo, você ganha 40% de desconto automaticamente em todas as multas"
          action="Ativar SNE"
          color="yellow"
        />
        
        <DicaCard
          icon={<Gavel size={24} className="text-blue-600" />}
          title="IA para Recursos"
          description="Nossa IA analisa suas multas e gera recursos automáticos com alta chance de sucesso"
          action="Usar IA"
          color="blue"
        />
        
        <DicaCard
          icon={<Clock size={24} className="text-purple-600" />}
          title="Não Deixe Vencer"
          description="Multas vencidas podem ter juros de até 20% e complicar sua situação"
          action="Calcular Agora"
          color="purple"
        />
      </div>

      {/* Legal Disclaimer */}
      <LegalDisclaimer
        type="info"
        title="Aviso Importante"
        content="Os cálculos são estimativos baseados em regras gerais e análise de jurisprudência. Sempre confirme informações nos portais oficiais dos órgãos de trânsito. Este app não substitui orientação jurídica profissional."
      />
    </div>
  );
}

function ResumoCard({ 
  icon, 
  title, 
  value, 
  subtitle, 
  color 
}: { 
  icon: React.ReactNode; 
  title: string; 
  value: string; 
  subtitle: string; 
  color: 'blue' | 'red' | 'green' | 'purple'; 
}) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    red: 'bg-red-50 border-red-200',
    green: 'bg-green-50 border-green-200',
    purple: 'bg-purple-50 border-purple-200',
  };

  return (
    <div className={`p-6 rounded-2xl border ${colorClasses[color]} text-center`}>
      <div className="flex justify-center mb-3">{icon}</div>
      <h5 className="font-semibold text-ink mb-1">{title}</h5>
      <p className="text-2xl font-bold text-ink mb-1">{value}</p>
      <p className="text-sm text-muted">{subtitle}</p>
    </div>
  );
}

function MultaCard({ 
  multa, 
  onClick,
  key
}: { 
  multa: MultaCalculadora; 
  onClick: () => void;
  key?: string | number;
}) {
  const economia = multa.valorOriginal - multa.valorComDescontoSNE;
  
  return (
    <button
      onClick={onClick}
      className="w-full p-4 border border-ink/8 rounded-xl hover:border-green-600/50 hover:bg-green-50/50 transition text-left"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-ink text-sm truncate">{multa.descricao}</p>
          <p className="text-xs text-muted">{multa.placa} • {multa.orgaoAutuador}</p>
        </div>
        
        <div className="text-right ml-4">
          <p className="font-bold text-ink">R$ {multa.valorOriginal.toFixed(2)}</p>
          <p className="text-xs text-green-600 font-semibold">
            Economia: R$ {economia.toFixed(2)}
          </p>
        </div>
        
        <ArrowRight size={16} className="text-muted ml-2" />
      </div>
    </button>
  );
}

function DicaCard({ 
  icon, 
  title, 
  description, 
  action, 
  color 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  action: string; 
  color: 'yellow' | 'blue' | 'purple'; 
}) {
  const colorClasses = {
    yellow: 'bg-yellow-50 border-yellow-200',
    blue: 'bg-blue-50 border-blue-200',
    purple: 'bg-purple-50 border-purple-200',
  };

  return (
    <div className={`p-6 rounded-2xl border ${colorClasses[color]}`}>
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <h5 className="font-semibold text-ink">{title}</h5>
      </div>
      <p className="text-sm text-muted mb-4 leading-relaxed">{description}</p>
      <button className="text-sm font-semibold text-brand hover:text-brand-emphasis flex items-center gap-1">
        {action}
        <ArrowRight size={14} />
      </button>
    </div>
  );
}