import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Settings, 
  User, 
  DollarSign, 
  Camera,
  CheckCircle2,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import type { ConsultaVeicular, LaudoConfig } from '../../types';
import { useLaudoStore } from '../../stores/laudoStore';
import { generateLaudoPDF } from '../../services/laudoPdfGenerator';
import { LegalDisclaimer } from '../../components/LegalDisclaimer';

interface GerarLaudoProps {
  consulta: ConsultaVeicular;
  onLaudoGenerated: () => void;
}

export function GerarLaudo({ consulta, onLaudoGenerated }: GerarLaudoProps) {
  const { setLaudo } = useLaudoStore();
  const [config, setConfig] = useState<LaudoConfig>({
    incluirFotos: false,
    nomeComprador: '',
    nomeVendedor: '',
    valorAnunciado: 0,
    observacoes: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const handleGenerateLaudo = async () => {
    try {
      setIsGenerating(true);
      setError(undefined);

      // Criar objeto do laudo
      const laudo = {
        id: `laudo-${Date.now()}`,
        numeroLaudo: `CC${Date.now().toString().slice(-8)}`,
        consulta,
        config,
        analiseRisco: {
          nivel: consulta.riskLevel,
          pontuacao: consulta.score,
          fatoresPositivos: consulta.multas.length === 0 ? ['Sem multas pendentes'] : [],
          fatoresNegativos: consulta.multas.length > 0 ? [`${consulta.multas.length} multa(s) pendente(s)`] : [],
          recomendacao: getRecomendacao(consulta.riskLevel),
        },
        sugestaoPreco: {
          fipe: consulta.dadosFipe?.valor || 0,
          precoSugerido: consulta.dadosFipe?.valor || 0,
          ajusteRecomendado: getAjusteRecomendado(consulta.riskLevel),
          justificativa: getJustificativaPreco(consulta),
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Gerar PDF
      const pdfBlob = await generateLaudoPDF(laudo);
      
      // Download do PDF
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `laudo-${consulta.veiculo.placa.replace(/\s/g, '')}-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Salvar no store
      setLaudo(laudo);
      
      onLaudoGenerated();
    } catch (err) {
      console.error('Erro ao gerar laudo:', err);
      setError('Erro ao gerar o laudo. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getRecomendacao = (riskLevel: string): string => {
    switch (riskLevel) {
      case 'baixo':
        return 'Veículo em excelente situação para negociação. Recomendamos a compra/venda com segurança, observando apenas os procedimentos legais de transferência.';
      case 'medio':
        return 'Veículo com algumas pendências que devem ser resolvidas antes da negociação. Recomendamos cautela e negociação dos valores das pendências.';
      case 'alto':
        return 'Veículo com muitas pendências e restrições. NÃO recomendamos a negociação até que todas as pendências sejam regularizadas.';
      default:
        return 'Situação indefinida. Recomendamos análise mais detalhada antes da negociação.';
    }
  };

  const getAjusteRecomendado = (riskLevel: string): number => {
    switch (riskLevel) {
      case 'baixo':
        return 0; // Sem ajuste
      case 'medio':
        return -0.1; // -10%
      case 'alto':
        return -0.25; // -25%
      default:
        return -0.05; // -5%
    }
  };

  const getJustificativaPreco = (consulta: ConsultaVeicular): string => {
    const fatores = [];
    
    if (consulta.multas.length > 0) {
      const totalMultas = consulta.multas.reduce((sum, m) => sum + m.valor, 0);
      fatores.push(`Multas pendentes: R$ ${totalMultas.toFixed(2)}`);
    }
    
    if (consulta.debitos.filter(d => d.status !== 'pago').length > 0) {
      const totalDebitos = consulta.debitos.filter(d => d.status !== 'pago').reduce((sum, d) => sum + d.valor, 0);
      fatores.push(`Débitos pendentes: R$ ${totalDebitos.toFixed(2)}`);
    }
    
    if (consulta.restricoes.length > 0) {
      fatores.push(`${consulta.restricoes.length} restrição(ões) ativa(s)`);
    }
    
    if (consulta.historicoProprietarios.length > 5) {
      fatores.push('Muitos proprietários anteriores');
    }

    if (fatores.length === 0) {
      return 'Veículo em excelente situação, sem pendências ou restrições. Preço de acordo com a tabela FIPE.';
    }

    return `Ajuste recomendado considerando: ${fatores.join(', ')}. Valores das pendências devem ser descontados do preço final.`;
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-soft text-brand-emphasis">
          <FileText size={32} strokeWidth={2} />
        </div>
        <h3 className="text-2xl font-bold text-ink mb-2">Configurar Laudo Profissional</h3>
        <p className="text-muted max-w-2xl mx-auto">
          Personalize seu laudo com informações adicionais e gere um documento profissional para compra/venda.
        </p>
      </div>

      {/* Configurações */}
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Dados das Partes */}
        <ConfigSection
          icon={<User size={20} className="text-blue-600" />}
          title="Dados das Partes (Opcional)"
          description="Inclua nomes do comprador e vendedor no laudo"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">
                Nome do Comprador
              </label>
              <input
                type="text"
                value={config.nomeComprador}
                onChange={(e) => setConfig(prev => ({ ...prev, nomeComprador: e.target.value }))}
                placeholder="Nome completo do comprador"
                className="w-full px-4 py-3 border border-ink/8 rounded-xl bg-surface focus:border-brand focus:ring-1 focus:ring-brand/20 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">
                Nome do Vendedor
              </label>
              <input
                type="text"
                value={config.nomeVendedor}
                onChange={(e) => setConfig(prev => ({ ...prev, nomeVendedor: e.target.value }))}
                placeholder="Nome completo do vendedor"
                className="w-full px-4 py-3 border border-ink/8 rounded-xl bg-surface focus:border-brand focus:ring-1 focus:ring-brand/20 outline-none transition"
              />
            </div>
          </div>
        </ConfigSection>

        {/* Valor Anunciado */}
        <ConfigSection
          icon={<DollarSign size={20} className="text-green-600" />}
          title="Valor de Referência"
          description="Valor anunciado para comparação com a tabela FIPE"
        >
          <div>
            <label className="block text-sm font-semibold text-ink mb-2">
              Valor Anunciado (R$)
            </label>
            <input
              type="number"
              value={config.valorAnunciado || ''}
              onChange={(e) => setConfig(prev => ({ ...prev, valorAnunciado: Number(e.target.value) || 0 }))}
              placeholder="Ex: 45000"
              className="w-full px-4 py-3 border border-ink/8 rounded-xl bg-surface focus:border-brand focus:ring-1 focus:ring-brand/20 outline-none transition"
            />
            {consulta.dadosFipe && (
              <p className="mt-2 text-sm text-muted">
                Tabela FIPE: R$ {consulta.dadosFipe.valor.toLocaleString('pt-BR')} ({consulta.dadosFipe.mesReferencia})
              </p>
            )}
          </div>
        </ConfigSection>

        {/* Fotos */}
        <ConfigSection
          icon={<Camera size={20} className="text-purple-600" />}
          title="Fotos do Veículo"
          description="Inclua espaço para fotos no laudo (funcionalidade futura)"
        >
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={config.incluirFotos}
              onChange={(e) => setConfig(prev => ({ ...prev, incluirFotos: e.target.checked }))}
              className="w-5 h-5 text-brand border-ink/20 rounded focus:ring-brand/20"
            />
            <span className="text-sm font-semibold text-ink">
              Incluir seção para fotos no laudo
            </span>
          </label>
          <p className="text-xs text-muted mt-2">
            Por enquanto, apenas reserva espaço no PDF. Upload de fotos será implementado em breve.
          </p>
        </ConfigSection>

        {/* Observações */}
        <ConfigSection
          icon={<Settings size={20} className="text-gray-600" />}
          title="Observações Adicionais"
          description="Comentários ou observações especiais para incluir no laudo"
        >
          <div>
            <label className="block text-sm font-semibold text-ink mb-2">
              Observações
            </label>
            <textarea
              value={config.observacoes}
              onChange={(e) => setConfig(prev => ({ ...prev, observacoes: e.target.value }))}
              placeholder="Ex: Veículo com pequenos riscos na lataria, pneus novos, etc."
              rows={4}
              className="w-full px-4 py-3 border border-ink/8 rounded-xl bg-surface focus:border-brand focus:ring-1 focus:ring-brand/20 outline-none transition resize-none"
            />
          </div>
        </ConfigSection>
      </div>

      {/* Resumo da Análise */}
      <div className="max-w-2xl mx-auto">
        <div className={`p-6 rounded-2xl border ${
          consulta.riskLevel === 'baixo' 
            ? 'bg-green-50 border-green-200' 
            : consulta.riskLevel === 'medio'
            ? 'bg-amber-50 border-amber-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center gap-3 mb-3">
            {consulta.riskLevel === 'baixo' ? (
              <CheckCircle2 size={24} className="text-green-600" />
            ) : (
              <AlertTriangle size={24} className={consulta.riskLevel === 'medio' ? 'text-amber-600' : 'text-red-600'} />
            )}
            <h4 className={`text-lg font-bold ${
              consulta.riskLevel === 'baixo' 
                ? 'text-green-800' 
                : consulta.riskLevel === 'medio'
                ? 'text-amber-800'
                : 'text-red-800'
            }`}>
              Análise de Risco: {consulta.riskLevel.toUpperCase()} (Score: {consulta.score}/100)
            </h4>
          </div>
          <p className={`text-sm ${
            consulta.riskLevel === 'baixo' 
              ? 'text-green-700' 
              : consulta.riskLevel === 'medio'
              ? 'text-amber-700'
              : 'text-red-700'
          }`}>
            {getRecomendacao(consulta.riskLevel)}
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="max-w-2xl mx-auto p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} className="text-red-600" />
            <p className="text-red-800 font-semibold">Erro</p>
          </div>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Ações */}
      <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={handleGenerateLaudo}
          disabled={isGenerating}
          className="inline-flex items-center gap-3 px-8 py-4 bg-brand text-white rounded-2xl font-semibold text-lg hover:bg-brand-emphasis transition shadow-lg shadow-brand/25 hover:shadow-xl hover:shadow-brand/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <Loader2 size={24} className="animate-spin" />
          ) : (
            <Download size={24} />
          )}
          {isGenerating ? 'Gerando Laudo...' : 'Gerar e Baixar PDF'}
        </button>
      </div>

      {/* Disclaimer */}
      <div className="max-w-2xl mx-auto">
        <LegalDisclaimer
          type="warning"
          title="Aviso Legal Importante"
          content="Este laudo é informativo e baseado em consultas a bases públicas de dados. NÃO substitui vistoria presencial por profissional qualificado. Recomendamos sempre uma inspeção técnica antes de finalizar qualquer negociação. Os dados podem conter imprecisões ou estar desatualizados."
        />
      </div>
    </div>
  );
}

function ConfigSection({ 
  icon, 
  title, 
  description, 
  children 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  children: React.ReactNode; 
}) {
  return (
    <div className="p-6 bg-surface border border-ink/8 rounded-2xl">
      <div className="flex items-start gap-3 mb-4">
        {icon}
        <div>
          <h4 className="text-lg font-semibold text-ink">{title}</h4>
          <p className="text-sm text-muted">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}