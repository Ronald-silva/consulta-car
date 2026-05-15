import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Shield, 
  Target, 
  BarChart3, 
  PieChart,
  Award,
  AlertTriangle,
  CheckCircle2,
  Zap,
  FileText,
  Gavel
} from 'lucide-react';
import type { MultaCalculadora } from '../../stores/calculadoraStore';
import { calcularEconomiaTotal, simularEstrategias } from '../../services/economiaService';

interface DashboardEconomiaProps {
  multas: MultaCalculadora[];
}

export function DashboardEconomia({ multas }: DashboardEconomiaProps) {
  if (multas.length === 0) {
    return (
      <div className="p-8 text-center">
        <FileText size={48} className="text-muted mx-auto mb-4" />
        <h3 className="text-xl font-bold text-ink mb-2">Nenhuma Multa Analisada</h3>
        <p className="text-muted">Importe suas multas ou use a calculadora rápida para ver o dashboard.</p>
      </div>
    );
  }

  const economiaTotal = calcularEconomiaTotal(multas);
  const estrategias = simularEstrategias(multas);
  
  const percentualEconomia = economiaTotal.valorTotal > 0 
    ? (economiaTotal.economiaMaxima / economiaTotal.valorTotal) * 100 
    : 0;

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-ink mb-2">Dashboard de Economia</h3>
        <p className="text-muted">Análise completa do seu potencial de economia</p>
      </div>

      {/* Resumo Principal */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
        <div className="text-center mb-6">
          <h4 className="text-3xl font-bold text-green-700 mb-2">
            R$ {economiaTotal.economiaMaxima.toFixed(2)}
          </h4>
          <p className="text-green-600 text-lg">
            Você pode economizar {percentualEconomia.toFixed(1)}% do total
          </p>
          <p className="text-sm text-green-500 mt-1">
            {economiaTotal.estrategiaRecomendada}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard
            icon={<FileText size={24} className="text-blue-600" />}
            title="Total de Multas"
            value={multas.length.toString()}
            subtitle="Analisadas"
          />
          
          <MetricCard
            icon={<DollarSign size={24} className="text-red-600" />}
            title="Valor Total"
            value={`R$ ${economiaTotal.valorTotal.toFixed(2)}`}
            subtitle="Sem estratégia"
          />
          
          <MetricCard
            icon={<TrendingUp size={24} className="text-green-600" />}
            title="Economia Máxima"
            value={`R$ ${economiaTotal.economiaMaxima.toFixed(2)}`}
            subtitle="Com melhor estratégia"
          />
          
          <MetricCard
            icon={<Shield size={24} className="text-purple-600" />}
            title="Pontos Evitados"
            value={economiaTotal.pontosEvitados.toString()}
            subtitle="Na sua CNH"
          />
        </div>
      </div>

      {/* Comparação de Estratégias */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <EstrategiaCard
          title="Pagar Todas com SNE"
          description="40% de desconto garantido"
          custo={estrategias.estrategiaSNE.custo}
          economia={estrategias.estrategiaSNE.economia}
          pontos={estrategias.estrategiaSNE.pontos}
          cor="green"
          vantagens={[
            'Desconto garantido de 40%',
            'Processo simples e rápido',
            'Sem risco de complicações'
          ]}
          desvantagens={[
            'Pontos aplicados na CNH',
            'Admite a infração'
          ]}
        />
        
        <EstrategiaCard
          title="Recorrer Todas com IA"
          description="Máxima economia potencial"
          custo={estrategias.estrategiaRecurso.custo}
          economia={estrategias.estrategiaRecurso.economia}
          pontos={estrategias.estrategiaRecurso.pontos}
          cor="blue"
          vantagens={[
            'Economia máxima se ganhar',
            'Evita pontos na CNH',
            'Recurso automático com IA'
          ]}
          desvantagens={[
            'Processo pode demorar',
            'Risco de perder e pagar integral'
          ]}
        />
        
        <EstrategiaCard
          title="Estratégia Mista"
          description="Melhor opção para cada multa"
          custo={estrategias.estrategiaMista.custo}
          economia={estrategias.estrategiaMista.economia}
          pontos={estrategias.estrategiaMista.pontos}
          cor="purple"
          recomendada={true}
          vantagens={[
            'Máxima economia inteligente',
            'Menor risco geral',
            'Estratégia personalizada'
          ]}
          desvantagens={[
            'Requer acompanhamento',
            'Processo mais complexo'
          ]}
        />
      </div>

      {/* Gráfico de Economia por Multa */}
      <div className="bg-surface border border-ink/8 rounded-2xl p-6">
        <h4 className="text-lg font-semibold text-ink mb-6 flex items-center gap-2">
          <BarChart3 size={20} />
          Economia por Multa
        </h4>
        
        <div className="space-y-4">
          {multas.slice(0, 5).map((multa, index) => {
            const economiaSNE = multa.valorOriginal - multa.valorComDescontoSNE;
            const economiaRecurso = multa.chanceSuccessoRecurso > 60 ? multa.valorOriginal : 0;
            const melhorEconomia = Math.max(economiaSNE, economiaRecurso);
            
            return (
              <div key={multa.id} className="flex items-center gap-4">
                <div className="w-8 h-8 bg-brand text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink text-sm truncate">{multa.descricao}</p>
                  <p className="text-xs text-muted">{multa.placa} • R$ {multa.valorOriginal.toFixed(2)}</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-xs text-muted">SNE</p>
                    <p className="font-bold text-green-600">R$ {economiaSNE.toFixed(0)}</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-xs text-muted">Recurso</p>
                    <p className="font-bold text-blue-600">R$ {economiaRecurso.toFixed(0)}</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-xs text-muted">Melhor</p>
                    <p className="font-bold text-purple-600">R$ {melhorEconomia.toFixed(0)}</p>
                  </div>
                </div>
                
                <div className="w-24">
                  {economiaRecurso > economiaSNE ? (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                      Recorrer
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                      SNE
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          
          {multas.length > 5 && (
            <p className="text-sm text-muted text-center py-2">
              +{multas.length - 5} multa(s) adicional(is)
            </p>
          )}
        </div>
      </div>

      {/* Análise de Risco CNH */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RiscoCard
          title="Situação Atual da CNH"
          pontosTotal={multas.reduce((sum, m) => sum + m.pontos, 0)}
          pontosEvitados={economiaTotal.pontosEvitados}
        />
        
        <RecomendacaoCard
          economiaTotal={economiaTotal}
          multas={multas}
        />
      </div>
    </div>
  );
}

function MetricCard({ 
  icon, 
  title, 
  value, 
  subtitle 
}: { 
  icon: React.ReactNode; 
  title: string; 
  value: string; 
  subtitle: string; 
}) {
  return (
    <div className="text-center">
      <div className="flex justify-center mb-2">{icon}</div>
      <h5 className="font-semibold text-ink text-sm">{title}</h5>
      <p className="text-xl font-bold text-ink">{value}</p>
      <p className="text-xs text-muted">{subtitle}</p>
    </div>
  );
}

function EstrategiaCard({ 
  title, 
  description, 
  custo, 
  economia, 
  pontos, 
  cor, 
  vantagens, 
  desvantagens, 
  recomendada = false 
}: { 
  title: string; 
  description: string; 
  custo: number; 
  economia: number; 
  pontos: number; 
  cor: 'green' | 'blue' | 'purple'; 
  vantagens: string[]; 
  desvantagens: string[]; 
  recomendada?: boolean; 
}) {
  const colorClasses = {
    green: 'bg-green-50 border-green-200',
    blue: 'bg-blue-50 border-blue-200',
    purple: 'bg-purple-50 border-purple-200',
  };

  const textColorClasses = {
    green: 'text-green-800',
    blue: 'text-blue-800',
    purple: 'text-purple-800',
  };

  return (
    <div className={`relative p-6 rounded-2xl border ${colorClasses[cor]} ${
      recomendada ? 'ring-2 ring-purple-300' : ''
    }`}>
      {recomendada && (
        <div className="absolute -top-3 left-4">
          <div className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full">
            <Award size={12} />
            RECOMENDADA
          </div>
        </div>
      )}
      
      <div className="mb-4">
        <h5 className={`font-bold ${textColorClasses[cor]} mb-1`}>{title}</h5>
        <p className="text-sm text-muted">{description}</p>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between">
          <span className="text-sm font-semibold">Custo Total:</span>
          <span className="font-bold">R$ {custo.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-sm font-semibold">Economia:</span>
          <span className="font-bold text-green-600">R$ {economia.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-sm font-semibold">Pontos CNH:</span>
          <span className={`font-bold ${pontos === 0 ? 'text-green-600' : 'text-amber-600'}`}>
            {pontos} pontos
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h6 className="text-xs font-bold text-green-700 mb-1">✓ VANTAGENS</h6>
          <ul className="space-y-1">
            {vantagens.slice(0, 2).map((vantagem, index) => (
              <li key={index} className="text-xs text-green-600 flex items-start gap-1">
                <CheckCircle2 size={10} className="mt-0.5 shrink-0" />
                {vantagem}
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h6 className="text-xs font-bold text-red-700 mb-1">⚠ DESVANTAGENS</h6>
          <ul className="space-y-1">
            {desvantagens.slice(0, 2).map((desvantagem, index) => (
              <li key={index} className="text-xs text-red-600 flex items-start gap-1">
                <AlertTriangle size={10} className="mt-0.5 shrink-0" />
                {desvantagem}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function RiscoCard({ 
  title, 
  pontosTotal, 
  pontosEvitados 
}: { 
  title: string; 
  pontosTotal: number; 
  pontosEvitados: number; 
}) {
  const getRiscoLevel = (pontos: number) => {
    if (pontos >= 20) return { level: 'Alto', color: 'red', message: 'Risco de suspensão da CNH' };
    if (pontos >= 14) return { level: 'Médio', color: 'amber', message: 'Atenção aos pontos' };
    return { level: 'Baixo', color: 'green', message: 'Situação controlada' };
  };

  const riscoAtual = getRiscoLevel(pontosTotal);
  const riscoComEstrategia = getRiscoLevel(pontosTotal - pontosEvitados);

  return (
    <div className="bg-surface border border-ink/8 rounded-2xl p-6">
      <h5 className="font-semibold text-ink mb-4 flex items-center gap-2">
        <Shield size={18} />
        {title}
      </h5>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted">Situação Atual:</span>
            <span className={`font-bold ${
              riscoAtual.color === 'red' ? 'text-red-600' : 
              riscoAtual.color === 'amber' ? 'text-amber-600' : 'text-green-600'
            }`}>
              {pontosTotal} pontos
            </span>
          </div>
          <p className={`text-xs ${
            riscoAtual.color === 'red' ? 'text-red-600' : 
            riscoAtual.color === 'amber' ? 'text-amber-600' : 'text-green-600'
          }`}>
            Risco {riscoAtual.level} - {riscoAtual.message}
          </p>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted">Com Estratégia:</span>
            <span className={`font-bold ${
              riscoComEstrategia.color === 'red' ? 'text-red-600' : 
              riscoComEstrategia.color === 'amber' ? 'text-amber-600' : 'text-green-600'
            }`}>
              {pontosTotal - pontosEvitados} pontos
            </span>
          </div>
          <p className={`text-xs ${
            riscoComEstrategia.color === 'red' ? 'text-red-600' : 
            riscoComEstrategia.color === 'amber' ? 'text-amber-600' : 'text-green-600'
          }`}>
            Risco {riscoComEstrategia.level} - {riscoComEstrategia.message}
          </p>
        </div>
        
        {pontosEvitados > 0 && (
          <div className="pt-3 border-t border-ink/8">
            <p className="text-sm font-semibold text-green-600">
              ✓ {pontosEvitados} pontos podem ser evitados
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function RecomendacaoCard({ 
  economiaTotal, 
  multas 
}: { 
  economiaTotal: any; 
  multas: MultaCalculadora[]; 
}) {
  const multasRecurso = multas.filter(m => m.chanceSuccessoRecurso > 60).length;
  const multasSNE = multas.length - multasRecurso;

  return (
    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-6">
      <h5 className="font-semibold text-purple-800 mb-4 flex items-center gap-2">
        <Target size={18} />
        Recomendação Inteligente
      </h5>
      
      <div className="space-y-4">
        <div>
          <p className="font-semibold text-purple-800 mb-2">
            {economiaTotal.estrategiaRecomendada}
          </p>
          <p className="text-sm text-purple-600">
            Economia estimada: R$ {economiaTotal.economiaMaxima.toFixed(2)}
          </p>
        </div>
        
        <div className="space-y-2">
          {multasRecurso > 0 && (
            <div className="flex items-center gap-2">
              <Gavel size={16} className="text-blue-600" />
              <span className="text-sm text-purple-700">
                {multasRecurso} multa(s) para recorrer com IA
              </span>
            </div>
          )}
          
          {multasSNE > 0 && (
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-green-600" />
              <span className="text-sm text-purple-700">
                {multasSNE} multa(s) para pagar com SNE
              </span>
            </div>
          )}
        </div>
        
        <div className="pt-3 border-t border-purple-200">
          <p className="text-xs text-purple-600">
            💡 Esta estratégia maximiza sua economia e minimiza riscos na CNH
          </p>
        </div>
      </div>
    </div>
  );
}