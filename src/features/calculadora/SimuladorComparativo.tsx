import React from 'react';
import { 
  ArrowLeft, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Shield, 
  CheckCircle2, 
  AlertTriangle,
  Gavel,
  Zap,
  Target,
  BarChart3,
  Loader2,
  Star,
  Award
} from 'lucide-react';
import type { MultaCalculadora, CenarioEconomia } from '../../stores/calculadoraStore';

interface SimuladorComparativoProps {
  multa: MultaCalculadora | null;
  cenarios: CenarioEconomia[];
  isCalculating: boolean;
  onGerarRecurso: (multa: MultaCalculadora) => void;
  onVoltar: () => void;
}

export function SimuladorComparativo({ 
  multa, 
  cenarios, 
  isCalculating, 
  onGerarRecurso, 
  onVoltar 
}: SimuladorComparativoProps) {
  if (!multa) {
    return (
      <div className="p-8 text-center">
        <AlertTriangle size={48} className="text-amber-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-ink mb-2">Nenhuma Multa Selecionada</h3>
        <p className="text-muted mb-6">Selecione uma multa para ver a simulação comparativa.</p>
        <button
          onClick={onVoltar}
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition"
        >
          <ArrowLeft size={20} />
          Voltar ao Dashboard
        </button>
      </div>
    );
  }

  const melhorCenario = cenarios.find(c => c.recomendado) || cenarios[0];

  return (
    <div className="p-8 space-y-8">
      {/* Header com dados da multa */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onVoltar}
          className="flex items-center gap-2 px-3 py-2 text-muted hover:text-ink hover:bg-canvas rounded-lg transition"
        >
          <ArrowLeft size={20} />
          Voltar
        </button>
        
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-ink">Simulação de Economia</h3>
          <p className="text-muted">Compare as opções e escolha a melhor estratégia</p>
        </div>
      </div>

      {/* Dados da Multa */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
        <h4 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
          <BarChart3 size={20} />
          Multa Analisada
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm font-semibold text-blue-700">Descrição</p>
            <p className="text-blue-900 font-medium">{multa.descricao}</p>
          </div>
          
          <div>
            <p className="text-sm font-semibold text-blue-700">Valor Original</p>
            <p className="text-xl font-bold text-blue-900">R$ {multa.valorOriginal.toFixed(2)}</p>
          </div>
          
          <div>
            <p className="text-sm font-semibold text-blue-700">Pontos CNH</p>
            <p className="text-xl font-bold text-blue-900">{multa.pontos} pontos</p>
          </div>
          
          <div>
            <p className="text-sm font-semibold text-blue-700">Órgão</p>
            <p className="text-blue-900 font-medium">{multa.orgaoAutuador}</p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isCalculating && (
        <div className="text-center py-12">
          <Loader2 size={48} className="text-green-600 mx-auto mb-4 animate-spin" />
          <h4 className="text-lg font-semibold text-ink mb-2">Analisando com IA...</h4>
          <p className="text-muted">Calculando chances de sucesso e cenários de economia</p>
        </div>
      )}

      {/* Cenários Comparativos */}
      {!isCalculating && cenarios.length > 0 && (
        <>
          {/* Recomendação Principal */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Award size={24} className="text-green-600" />
              <h4 className="text-xl font-bold text-green-800">Recomendação Inteligente</h4>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-green-800 mb-1">
                  {melhorCenario.nome}
                </p>
                <p className="text-green-600">{melhorCenario.descricao}</p>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-green-600 font-semibold">Economia</p>
                <p className="text-2xl font-bold text-green-700">
                  R$ {melhorCenario.economia.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Cards de Cenários */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {cenarios.map((cenario) => (
              <CenarioCard
                key={cenario.id}
                cenario={cenario}
                multa={multa}
                isRecomendado={cenario.recomendado}
                onGerarRecurso={() => onGerarRecurso(multa)}
              />
            ))}
          </div>

          {/* Gráfico Visual de Comparação */}
          <div className="bg-surface border border-ink/8 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-ink mb-6 flex items-center gap-2">
              <BarChart3 size={20} />
              Comparação Visual
            </h4>
            
            <div className="space-y-4">
              {cenarios.map((cenario) => (
                <div key={cenario.id} className="flex items-center gap-4">
                  <div className="w-24 text-sm font-semibold text-ink">
                    {cenario.nome}
                  </div>
                  
                  <div className="flex-1 bg-gray-200 rounded-full h-8 relative overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        cenario.cor === 'green' 
                          ? 'bg-green-500' 
                          : cenario.cor === 'blue'
                          ? 'bg-blue-500'
                          : 'bg-red-500'
                      }`}
                      style={{ 
                        width: `${Math.max(10, (cenario.economia / multa.valorOriginal) * 100)}%` 
                      }}
                    />
                    
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-white drop-shadow">
                        R$ {cenario.valor.toFixed(0)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="w-32 text-right">
                    <p className="text-sm font-bold text-ink">
                      R$ {cenario.economia.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted">economia</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Análise Detalhada */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnaliseCard
              title="Impacto na CNH"
              items={[
                {
                  label: 'Pontos com SNE',
                  value: `${multa.pontos} pontos`,
                  color: 'amber'
                },
                {
                  label: 'Pontos se recorrer e ganhar',
                  value: '0 pontos',
                  color: 'green'
                },
                {
                  label: 'Risco de suspensão',
                  value: multa.pontos >= 7 ? 'Alto' : 'Baixo',
                  color: multa.pontos >= 7 ? 'red' : 'green'
                }
              ]}
            />
            
            <AnaliseCard
              title="Análise Temporal"
              items={[
                {
                  label: 'Pagamento SNE',
                  value: 'Imediato',
                  color: 'green'
                },
                {
                  label: 'Recurso com IA',
                  value: '15-30 dias',
                  color: 'blue'
                },
                {
                  label: 'Prazo para recurso',
                  value: multa.prazoRecurso ? 
                    `${Math.ceil((new Date(multa.prazoRecurso).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} dias` : 
                    'Consultar',
                  color: 'amber'
                }
              ]}
            />
          </div>
        </>
      )}
    </div>
  );
}

function CenarioCard({ 
  cenario, 
  multa, 
  isRecomendado, 
  onGerarRecurso,
  key
}: { 
  cenario: CenarioEconomia; 
  multa: MultaCalculadora; 
  isRecomendado: boolean; 
  onGerarRecurso: () => void;
  key?: string | number;
}) {
  const getIcon = () => {
    switch (cenario.id) {
      case 'sne':
        return <Zap size={24} className="text-green-600" />;
      case 'recurso':
        return <Gavel size={24} className="text-blue-600" />;
      default:
        return <Clock size={24} className="text-red-600" />;
    }
  };

  const getBorderColor = () => {
    if (isRecomendado) return 'border-green-400 ring-2 ring-green-200';
    return cenario.cor === 'green' 
      ? 'border-green-200' 
      : cenario.cor === 'blue'
      ? 'border-blue-200'
      : 'border-red-200';
  };

  const getBgColor = () => {
    return cenario.cor === 'green' 
      ? 'bg-green-50' 
      : cenario.cor === 'blue'
      ? 'bg-blue-50'
      : 'bg-red-50';
  };

  return (
    <div className={`relative p-6 rounded-2xl border ${getBorderColor()} ${getBgColor()}`}>
      {isRecomendado && (
        <div className="absolute -top-3 left-4">
          <div className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
            <Star size={12} />
            RECOMENDADO
          </div>
        </div>
      )}
      
      <div className="flex items-center gap-3 mb-4">
        {getIcon()}
        <div>
          <h5 className="font-bold text-ink">{cenario.nome}</h5>
          <p className="text-sm text-muted">{cenario.descricao}</p>
        </div>
      </div>

      {/* Valores Principais */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-ink">Valor a pagar:</span>
          <span className="text-xl font-bold text-ink">R$ {cenario.valor.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-ink">Economia:</span>
          <span className={`text-lg font-bold ${
            cenario.economia > 0 ? 'text-green-600' : 'text-gray-500'
          }`}>
            R$ {cenario.economia.toFixed(2)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-ink">Pontos CNH:</span>
          <span className={`font-bold ${
            cenario.pontos === 0 ? 'text-green-600' : 'text-amber-600'
          }`}>
            {cenario.pontos} pontos
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-ink">Prazo:</span>
          <span className="text-sm text-muted">{cenario.prazo}</span>
        </div>
      </div>

      {/* Vantagens e Desvantagens */}
      <div className="space-y-4 mb-6">
        <div>
          <h6 className="text-xs font-bold text-green-700 mb-2">✓ VANTAGENS</h6>
          <ul className="space-y-1">
            {cenario.vantagens.slice(0, 2).map((vantagem, index) => (
              <li key={index} className="text-xs text-green-600 flex items-start gap-1">
                <CheckCircle2 size={12} className="mt-0.5 shrink-0" />
                {vantagem}
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h6 className="text-xs font-bold text-red-700 mb-2">⚠ DESVANTAGENS</h6>
          <ul className="space-y-1">
            {cenario.desvantagens.slice(0, 2).map((desvantagem, index) => (
              <li key={index} className="text-xs text-red-600 flex items-start gap-1">
                <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                {desvantagem}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Ação */}
      {cenario.id === 'recurso' && (
        <button
          onClick={onGerarRecurso}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
        >
          <Gavel size={18} />
          Gerar Recurso com IA
        </button>
      )}
      
      {cenario.id === 'sne' && (
        <div className="text-center">
          <p className="text-sm font-semibold text-green-700">
            💡 Pague até o vencimento com 40% OFF
          </p>
        </div>
      )}
      
      {cenario.id === 'integral' && (
        <div className="text-center">
          <p className="text-sm font-semibold text-red-700">
            ⚠️ Não recomendado - Valor aumenta com juros
          </p>
        </div>
      )}
    </div>
  );
}

function AnaliseCard({ 
  title, 
  items 
}: { 
  title: string; 
  items: Array<{ label: string; value: string; color: string }>; 
}) {
  return (
    <div className="bg-surface border border-ink/8 rounded-2xl p-6">
      <h5 className="font-semibold text-ink mb-4 flex items-center gap-2">
        <Target size={18} />
        {title}
      </h5>
      
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-sm text-muted">{item.label}:</span>
            <span className={`font-semibold ${
              item.color === 'green' 
                ? 'text-green-600' 
                : item.color === 'red'
                ? 'text-red-600'
                : item.color === 'blue'
                ? 'text-blue-600'
                : 'text-amber-600'
            }`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}