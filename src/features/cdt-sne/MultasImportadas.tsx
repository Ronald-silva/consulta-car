import React, { useState } from 'react';
import { 
  Download, 
  DollarSign, 
  Calendar, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2,
  Gavel,
  ExternalLink,
  Filter,
  Search,
  TrendingDown,
  Clock,
  FileText
} from 'lucide-react';
import { useCDTSNEStore, type MultaImportada } from '../../stores/cdtSneStore';
import { importMultasFromGovBr, calculateSNESavings } from '../../services/govIntegrationService';

export function MultasImportadas() {
  const { 
    multasImportadas, 
    sneStatus,
    isLoading, 
    error,
    importMultas,
    updateMultaStatus,
    setLoading,
    setError,
    clearError
  } = useCDTSNEStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pendente' | 'paga' | 'contestada'>('all');

  const handleImportMultas = async () => {
    setLoading(true);
    clearError();
    
    try {
      await importMultas();
    } catch (err) {
      setError('Erro ao importar multas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleGerarRecurso = (multa: MultaImportada) => {
    // Integração com o Assistente de Recurso (Etapa 3)
    const recursoData = {
      numeroAuto: multa.numeroAuto,
      placa: multa.placa,
      valor: multa.valorOriginal,
      dataInfracao: multa.dataInfracao,
      descricao: multa.descricao,
      orgaoAutuador: multa.orgaoAutuador,
    };
    
    // Disparar evento para abrir o wizard de recurso
    window.dispatchEvent(new CustomEvent('openRecursoWizard', { 
      detail: recursoData 
    }));
  };

  const filteredMultas = multasImportadas.filter(multa => {
    const matchesSearch = searchQuery === '' || 
      multa.placa.toLowerCase().includes(searchQuery.toLowerCase()) ||
      multa.numeroAuto.includes(searchQuery) ||
      multa.descricao.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || multa.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const economiaTotal = multasImportadas.reduce((total, multa) => {
    return total + (multa.temDesconto ? (multa.valorOriginal - multa.valorComDesconto) : 0);
  }, 0);

  const valorTotal = multasImportadas.reduce((total, multa) => total + multa.valorOriginal, 0);
  const valorComDesconto = multasImportadas.reduce((total, multa) => {
    return total + (multa.temDesconto ? multa.valorComDesconto : multa.valorOriginal);
  }, 0);

  return (
    <div className="p-8 space-y-8">
      {/* Header com Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={<FileText size={24} className="text-blue-600" />}
          title="Total de Multas"
          value={multasImportadas.length.toString()}
          subtitle="Importadas do gov.br"
          color="blue"
        />
        
        <StatCard
          icon={<DollarSign size={24} className="text-red-600" />}
          title="Valor Original"
          value={`R$ ${valorTotal.toFixed(2)}`}
          subtitle="Sem desconto SNE"
          color="red"
        />
        
        <StatCard
          icon={<TrendingDown size={24} className="text-green-600" />}
          title="Economia SNE"
          value={`R$ ${economiaTotal.toFixed(2)}`}
          subtitle={`${((economiaTotal / valorTotal) * 100 || 0).toFixed(1)}% de desconto`}
          color="green"
        />
      </div>

      {/* Ações Principais */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-ink mb-2">Suas Multas Importadas</h3>
          <p className="text-muted">
            {multasImportadas.length === 0 
              ? 'Importe suas multas do gov.br para ver os descontos disponíveis'
              : `${filteredMultas.length} de ${multasImportadas.length} multas`
            }
          </p>
        </div>
        
        <button
          onClick={handleImportMultas}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <Download size={20} />
          {isLoading ? 'Importando...' : 'Atualizar Multas'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} className="text-red-600" />
            <p className="text-red-800 font-semibold">Erro</p>
          </div>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Filtros e Busca */}
      {multasImportadas.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por placa, número do auto ou descrição..."
                className="w-full pl-10 pr-4 py-3 border border-ink/8 rounded-xl bg-surface focus:border-brand focus:ring-1 focus:ring-brand/20 outline-none transition"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-muted" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-3 border border-ink/8 rounded-xl bg-surface focus:border-brand focus:ring-1 focus:ring-brand/20 outline-none"
            >
              <option value="all">Todas</option>
              <option value="pendente">Pendentes</option>
              <option value="paga">Pagas</option>
              <option value="contestada">Contestadas</option>
            </select>
          </div>
        </div>
      )}

      {/* Lista de Multas */}
      {multasImportadas.length === 0 ? (
        <EmptyState onImport={handleImportMultas} isLoading={isLoading} />
      ) : (
        <div className="space-y-4">
          {filteredMultas.map((multa) => (
            <MultaCard
              key={multa.id}
              multa={multa}
              onGerarRecurso={() => handleGerarRecurso(multa)}
              onUpdateStatus={(status) => updateMultaStatus(multa.id, status)}
            />
          ))}
          
          {filteredMultas.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted">Nenhuma multa encontrada com os filtros aplicados.</p>
            </div>
          )}
        </div>
      )}

      {/* Resumo de Economia */}
      {multasImportadas.length > 0 && sneStatus.isSubscribed && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
          <h4 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
            <TrendingDown size={20} />
            Resumo da Economia com SNE
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-700">R$ {valorTotal.toFixed(2)}</p>
              <p className="text-sm text-green-600">Valor original</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-green-700">R$ {valorComDesconto.toFixed(2)}</p>
              <p className="text-sm text-green-600">Com desconto SNE</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-green-800">R$ {economiaTotal.toFixed(2)}</p>
              <p className="text-sm text-green-600">Economia total</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ 
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
  color: 'blue' | 'red' | 'green'; 
}) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    red: 'bg-red-50 border-red-200',
    green: 'bg-green-50 border-green-200',
  };

  return (
    <div className={`p-6 rounded-2xl border ${colorClasses[color]}`}>
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <h4 className="font-semibold text-ink">{title}</h4>
      </div>
      <p className="text-2xl font-bold text-ink mb-1">{value}</p>
      <p className="text-sm text-muted">{subtitle}</p>
    </div>
  );
}

function MultaCard({ 
  multa, 
  onGerarRecurso, 
  onUpdateStatus,
  key
}: { 
  multa: MultaImportada; 
  onGerarRecurso: () => void; 
  onUpdateStatus: (status: MultaImportada['status']) => void;
  key?: string | number;
}) {
  const getStatusColor = (status: MultaImportada['status']) => {
    switch (status) {
      case 'pendente':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'paga':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'contestada':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getStatusIcon = (status: MultaImportada['status']) => {
    switch (status) {
      case 'pendente':
        return <Clock size={16} className="text-amber-600" />;
      case 'paga':
        return <CheckCircle2 size={16} className="text-green-600" />;
      case 'contestada':
        return <Gavel size={16} className="text-blue-600" />;
      default:
        return <AlertTriangle size={16} className="text-gray-600" />;
    }
  };

  return (
    <div className="bg-surface border border-ink/8 rounded-2xl p-6 hover:border-brand/25 hover:shadow-lg transition">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Informações Principais */}
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-bold text-ink text-lg">{multa.descricao}</h4>
              <p className="text-muted text-sm">
                Auto nº {multa.numeroAuto} • {multa.orgaoAutuador}
              </p>
            </div>
            
            <div className={`px-3 py-1 rounded-full border text-sm font-semibold ${getStatusColor(multa.status)}`}>
              <div className="flex items-center gap-1">
                {getStatusIcon(multa.status)}
                {multa.status.charAt(0).toUpperCase() + multa.status.slice(1)}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted font-semibold">Placa</p>
              <p className="text-ink font-mono">{multa.placa}</p>
            </div>
            
            <div>
              <p className="text-muted font-semibold">Data</p>
              <p className="text-ink">{new Date(multa.dataInfracao).toLocaleDateString('pt-BR')}</p>
            </div>
            
            <div>
              <p className="text-muted font-semibold">Valor Original</p>
              <p className="text-ink font-semibold">R$ {multa.valorOriginal.toFixed(2)}</p>
            </div>
            
            <div>
              <p className="text-muted font-semibold">Com SNE</p>
              <div className="flex items-center gap-2">
                <p className="text-green-600 font-bold">R$ {multa.valorComDesconto.toFixed(2)}</p>
                {multa.temDesconto && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                    -40%
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {multa.prazoRecurso && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={16} className="text-amber-600" />
              <span className="text-muted">
                Prazo para recurso: {new Date(multa.prazoRecurso).toLocaleDateString('pt-BR')}
              </span>
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="flex flex-col gap-2 lg:w-48">
          {multa.status === 'pendente' && (
            <>
              <button
                onClick={onGerarRecurso}
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg font-semibold hover:bg-brand-emphasis transition text-sm"
              >
                <Gavel size={16} />
                Gerar Recurso
              </button>
              
              <button
                onClick={() => onUpdateStatus('paga')}
                className="inline-flex items-center gap-2 px-4 py-2 border border-green-600 text-green-600 rounded-lg font-semibold hover:bg-green-50 transition text-sm"
              >
                <CheckCircle2 size={16} />
                Marcar como Paga
              </button>
            </>
          )}
          
          {multa.status === 'paga' && (
            <div className="text-center py-2">
              <CheckCircle2 size={24} className="text-green-600 mx-auto mb-1" />
              <p className="text-sm font-semibold text-green-600">Paga</p>
            </div>
          )}
          
          {multa.status === 'contestada' && (
            <div className="text-center py-2">
              <Gavel size={24} className="text-blue-600 mx-auto mb-1" />
              <p className="text-sm font-semibold text-blue-600">Contestada</p>
            </div>
          )}
        </div>
      </div>

      {/* Economia Destacada */}
      {multa.temDesconto && multa.status === 'pendente' && (
        <div className="mt-4 pt-4 border-t border-ink/8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown size={16} className="text-green-600" />
                <span className="text-sm font-semibold text-green-800">
                  Economia com SNE: R$ {(multa.valorOriginal - multa.valorComDesconto).toFixed(2)}
                </span>
              </div>
              <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                40% OFF
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ 
  onImport, 
  isLoading 
}: { 
  onImport: () => void; 
  isLoading: boolean; 
}) {
  return (
    <div className="text-center py-16">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
        <Download size={40} />
      </div>
      
      <h3 className="text-xl font-bold text-ink mb-2">Nenhuma Multa Importada</h3>
      <p className="text-muted mb-6 max-w-md mx-auto">
        Importe suas multas do gov.br para ver automaticamente os descontos disponíveis com o SNE.
      </p>
      
      <button
        onClick={onImport}
        disabled={isLoading}
        className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        <Download size={24} />
        {isLoading ? 'Importando...' : 'Importar Minhas Multas'}
      </button>
      
      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl max-w-md mx-auto">
        <div className="flex items-start gap-2">
          <AlertTriangle size={16} className="text-amber-600 mt-0.5" />
          <div className="text-sm text-amber-800">
            <strong>Importante:</strong> Você precisa ter a CDT ativa e estar conectado ao gov.br para importar suas multas.
          </div>
        </div>
      </div>
    </div>
  );
}