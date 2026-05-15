import React from 'react';
import { 
  Car, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  FileText, 
  Shield, 
  Clock, 
  TrendingUp,
  Users,
  Gavel,
  ExternalLink
} from 'lucide-react';
import type { ConsultaVeicular } from '../../types';
import { useLaudoStore } from '../../stores/laudoStore';

interface DashboardResultadosProps {
  consulta: ConsultaVeicular;
  onGerarLaudo: () => void;
}

export function DashboardResultados({ consulta, onGerarLaudo }: DashboardResultadosProps) {
  const { getTotalDebitos, getTotalMultas, hasRestrictions, getRiskFactors } = useLaudoStore();
  
  const totalDebitos = getTotalDebitos();
  const totalMultas = getTotalMultas();
  const temRestricoes = hasRestrictions();
  const { positive, negative } = getRiskFactors();

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'baixo':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'medio':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'alto':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'baixo':
        return <CheckCircle2 size={24} className="text-green-600" />;
      case 'medio':
        return <AlertTriangle size={24} className="text-amber-600" />;
      case 'alto':
        return <X size={24} className="text-red-600" />;
      default:
        return <AlertTriangle size={24} className="text-gray-600" />;
    }
  };

  const getRiskText = (level: string) => {
    switch (level) {
      case 'baixo':
        return 'RECOMENDADO';
      case 'medio':
        return 'CAUTELA';
      case 'alto':
        return 'ALTO RISCO';
      default:
        return 'INDEFINIDO';
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header com dados do veículo */}
      <div className="bg-gradient-to-r from-brand-soft/30 to-surface p-6 rounded-2xl border border-brand/20">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand text-white">
              <Car size={32} strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-ink">
                {consulta.veiculo.marca} {consulta.veiculo.modelo}
              </h3>
              <p className="text-lg text-muted font-mono">
                {consulta.veiculo.placa} • {consulta.veiculo.anoFabricacao}/{consulta.veiculo.anoModelo}
              </p>
              <p className="text-sm text-muted">
                {consulta.veiculo.cor} • {consulta.veiculo.combustivel} • {consulta.veiculo.categoria}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-muted">Consultado em</p>
            <p className="font-semibold text-ink">
              {new Date(consulta.consultadoEm).toLocaleString('pt-BR')}
            </p>
          </div>
        </div>
      </div>

      {/* Situação Geral */}
      <div className={`p-6 rounded-2xl border ${getRiskColor(consulta.riskLevel)}`}>
        <div className="flex items-center gap-4">
          {getRiskIcon(consulta.riskLevel)}
          <div className="flex-1">
            <h4 className="text-xl font-bold mb-1">
              {getRiskText(consulta.riskLevel)} - SCORE: {consulta.score}/100
            </h4>
            <p className="text-sm opacity-90">
              {consulta.riskLevel === 'baixo' && 'Veículo em boa situação para negociação'}
              {consulta.riskLevel === 'medio' && 'Veículo com algumas pendências, analise com cuidado'}
              {consulta.riskLevel === 'alto' && 'Veículo com muitas pendências, não recomendado'}
            </p>
          </div>
          <button
            onClick={onGerarLaudo}
            className="px-6 py-3 bg-brand text-white rounded-xl font-semibold hover:bg-brand-emphasis transition shadow-lg"
          >
            Gerar Laudo PDF
          </button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          icon={<FileText size={24} className="text-red-600" />}
          title="Multas Pendentes"
          value={`${consulta.multas.length}`}
          subtitle={`R$ ${totalMultas.toFixed(2)}`}
          status={consulta.multas.length === 0 ? 'success' : 'danger'}
        />
        
        <SummaryCard
          icon={<Clock size={24} className="text-amber-600" />}
          title="Débitos"
          value={`${consulta.debitos.filter(d => d.status !== 'pago').length}`}
          subtitle={`R$ ${totalDebitos.toFixed(2)}`}
          status={totalDebitos === 0 ? 'success' : 'warning'}
        />
        
        <SummaryCard
          icon={<Shield size={24} className="text-purple-600" />}
          title="Restrições"
          value={`${consulta.restricoes.length}`}
          subtitle={temRestricoes ? 'Verificar detalhes' : 'Sem restrições'}
          status={temRestricoes ? 'danger' : 'success'}
        />
        
        <SummaryCard
          icon={<TrendingUp size={24} className="text-green-600" />}
          title="Valor FIPE"
          value={consulta.dadosFipe ? `R$ ${consulta.dadosFipe.valor.toLocaleString('pt-BR')}` : 'N/A'}
          subtitle={consulta.dadosFipe?.mesReferencia || 'Não disponível'}
          status="info"
        />
      </div>

      {/* Detalhes em Abas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Coluna 1: Multas e Débitos */}
        <div className="space-y-6">
          {/* Multas */}
          <DetailSection
            title="Multas Pendentes"
            icon={<FileText size={20} className="text-red-600" />}
            count={consulta.multas.length}
          >
            {consulta.multas.length === 0 ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-center">
                <CheckCircle2 size={32} className="mx-auto text-green-600 mb-2" />
                <p className="font-semibold text-green-800">Sem multas pendentes</p>
                <p className="text-sm text-green-600">Situação regular</p>
              </div>
            ) : (
              <div className="space-y-3">
                {consulta.multas.slice(0, 3).map((multa, index) => (
                  <div key={index} className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-red-800">
                          {multa.descricaoInfracao}
                        </p>
                        <p className="text-sm text-red-600">
                          {multa.orgaoAutuador} • {new Date(multa.dataInfracao).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-800">R$ {multa.valor.toFixed(2)}</p>
                        <p className="text-xs text-red-600">{multa.pontos} pontos</p>
                      </div>
                    </div>
                    <button className="mt-2 flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand-emphasis">
                      <Gavel size={12} />
                      Gerar Recurso
                    </button>
                  </div>
                ))}
                {consulta.multas.length > 3 && (
                  <p className="text-sm text-muted text-center">
                    +{consulta.multas.length - 3} multa(s) adicional(is)
                  </p>
                )}
              </div>
            )}
          </DetailSection>

          {/* Débitos */}
          <DetailSection
            title="Débitos"
            icon={<Clock size={20} className="text-amber-600" />}
            count={consulta.debitos.filter(d => d.status !== 'pago').length}
          >
            {consulta.debitos.filter(d => d.status !== 'pago').length === 0 ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-center">
                <CheckCircle2 size={32} className="mx-auto text-green-600 mb-2" />
                <p className="font-semibold text-green-800">Sem débitos pendentes</p>
                <p className="text-sm text-green-600">Situação regular</p>
              </div>
            ) : (
              <div className="space-y-3">
                {consulta.debitos.filter(d => d.status !== 'pago').map((debito, index) => (
                  <div key={index} className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-amber-800">{debito.descricao}</p>
                        <p className="text-sm text-amber-600">
                          Vencimento: {new Date(debito.vencimento).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <p className="font-bold text-amber-800">R$ {debito.valor.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DetailSection>
        </div>

        {/* Coluna 2: Restrições e Outros */}
        <div className="space-y-6">
          {/* Restrições */}
          <DetailSection
            title="Restrições"
            icon={<Shield size={20} className="text-purple-600" />}
            count={consulta.restricoes.length}
          >
            {consulta.restricoes.length === 0 ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-center">
                <CheckCircle2 size={32} className="mx-auto text-green-600 mb-2" />
                <p className="font-semibold text-green-800">Sem restrições</p>
                <p className="text-sm text-green-600">Veículo livre</p>
              </div>
            ) : (
              <div className="space-y-3">
                {consulta.restricoes.map((restricao, index) => (
                  <div key={index} className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertTriangle size={18} className="text-red-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-red-800">
                          {restricao.tipo.replace('_', ' ').toUpperCase()}
                        </p>
                        <p className="text-sm text-red-600">{restricao.descricao}</p>
                        <p className="text-xs text-red-500 mt-1">
                          Desde: {new Date(restricao.dataInclusao).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DetailSection>

          {/* Recalls */}
          <DetailSection
            title="Recalls"
            icon={<AlertTriangle size={20} className="text-orange-600" />}
            count={consulta.recalls.filter(r => r.status === 'pendente').length}
          >
            {consulta.recalls.filter(r => r.status === 'pendente').length === 0 ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-center">
                <CheckCircle2 size={32} className="mx-auto text-green-600 mb-2" />
                <p className="font-semibold text-green-800">Recalls em dia</p>
                <p className="text-sm text-green-600">Nenhum recall pendente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {consulta.recalls.filter(r => r.status === 'pendente').map((recall, index) => (
                  <div key={index} className={`p-4 rounded-xl border ${
                    recall.risco === 'alto' 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-amber-50 border-amber-200'
                  }`}>
                    <div className="flex items-start gap-3">
                      <AlertTriangle size={18} className={
                        recall.risco === 'alto' ? 'text-red-600' : 'text-amber-600'
                      } />
                      <div>
                        <p className={`font-semibold ${
                          recall.risco === 'alto' ? 'text-red-800' : 'text-amber-800'
                        }`}>
                          {recall.campanha} - RISCO {recall.risco.toUpperCase()}
                        </p>
                        <p className={`text-sm ${
                          recall.risco === 'alto' ? 'text-red-600' : 'text-amber-600'
                        }`}>
                          {recall.descricao}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DetailSection>

          {/* Histórico de Proprietários */}
          <DetailSection
            title="Histórico"
            icon={<Users size={20} className="text-blue-600" />}
            count={consulta.historicoProprietarios.length}
          >
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="font-semibold text-blue-800 mb-2">
                {consulta.historicoProprietarios.length} proprietário(s)
              </p>
              <div className="space-y-2">
                {consulta.historicoProprietarios.slice(0, 3).map((hist, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-blue-700">
                      {index === 0 ? 'Atual' : `${index + 1}º proprietário`}
                    </span>
                    <span className="text-blue-600">
                      {hist.municipio}/{hist.uf} • {new Date(hist.dataTransferencia).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                ))}
              </div>
              {consulta.historicoProprietarios.length > 5 && (
                <p className="text-xs text-blue-600 mt-2">
                  ⚠️ Muitos proprietários anteriores
                </p>
              )}
            </div>
          </DetailSection>
        </div>
      </div>

      {/* Fatores de Risco */}
      {(positive.length > 0 || negative.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {positive.length > 0 && (
            <div className="p-6 bg-green-50 border border-green-200 rounded-xl">
              <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                <CheckCircle2 size={18} />
                Pontos Positivos
              </h4>
              <ul className="space-y-1">
                {positive.map((factor, index) => (
                  <li key={index} className="text-sm text-green-700">• {factor}</li>
                ))}
              </ul>
            </div>
          )}

          {negative.length > 0 && (
            <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
              <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                <AlertTriangle size={18} />
                Pontos de Atenção
              </h4>
              <ul className="space-y-1">
                {negative.map((factor, index) => (
                  <li key={index} className="text-sm text-red-700">• {factor}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SummaryCard({ 
  icon, 
  title, 
  value, 
  subtitle, 
  status 
}: { 
  icon: React.ReactNode; 
  title: string; 
  value: string; 
  subtitle: string; 
  status: 'success' | 'warning' | 'danger' | 'info'; 
}) {
  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-amber-200 bg-amber-50';
      case 'danger':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <div className={`p-6 rounded-xl border ${getStatusColor()}`}>
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <h4 className="font-semibold text-ink">{title}</h4>
      </div>
      <p className="text-2xl font-bold text-ink mb-1">{value}</p>
      <p className="text-sm text-muted">{subtitle}</p>
    </div>
  );
}

function DetailSection({ 
  title, 
  icon, 
  count, 
  children 
}: { 
  title: string; 
  icon: React.ReactNode; 
  count: number; 
  children: React.ReactNode; 
}) {
  return (
    <div className="bg-surface border border-ink/8 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h4 className="font-semibold text-ink">{title}</h4>
        <span className="px-2 py-1 bg-brand-soft text-brand-emphasis text-xs font-bold rounded-full">
          {count}
        </span>
      </div>
      {children}
    </div>
  );
}