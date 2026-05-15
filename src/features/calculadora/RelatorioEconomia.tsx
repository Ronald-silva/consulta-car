import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  Shield,
  Target,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Share2,
  Printer
} from 'lucide-react';
import { useCalculadoraStore, type MultaCalculadora, type RelatorioEconomia as RelatorioType } from '../../stores/calculadoraStore';
import { generateRelatorioEconomiaPDF } from '../../services/relatorioEconomiaPdfGenerator';

interface RelatorioEconomiaProps {
  multas: MultaCalculadora[];
  onVoltar: () => void;
}

export function RelatorioEconomia({ multas, onVoltar }: RelatorioEconomiaProps) {
  const { 
    gerarRelatorioEconomia, 
    salvarRelatorio, 
    relatoriosGerados,
    isCalculating 
  } = useCalculadoraStore();

  const [relatorioAtual, setRelatorioAtual] = useState<RelatorioType | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleGerarRelatorio = async () => {
    if (multas.length === 0) return;
    
    try {
      const relatorio = await gerarRelatorioEconomia(multas);
      setRelatorioAtual(relatorio);
      salvarRelatorio(relatorio);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
    }
  };

  const handleDownloadPDF = async () => {
    if (!relatorioAtual) return;
    
    setIsGeneratingPDF(true);
    
    try {
      const pdfBlob = await generateRelatorioEconomiaPDF(relatorioAtual);
      
      // Download do PDF
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio-economia-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleCompartilhar = async () => {
    if (!relatorioAtual) return;
    
    const texto = `💰 Relatório de Economia - Consulta Car

📊 Resumo:
• ${relatorioAtual.multasAnalisadas.length} multas analisadas
• Economia total: R$ ${relatorioAtual.economiaTotal.toFixed(2)}
• Estratégia: ${relatorioAtual.melhorEstrategia}
• Pontos evitados: ${relatorioAtual.pontosEvitados}

🎯 Com a estratégia certa, você pode economizar até ${((relatorioAtual.economiaTotal / relatorioAtual.multasAnalisadas.reduce((sum, m) => sum + m.valorOriginal, 0)) * 100).toFixed(1)}%!

Gerado pelo app Consulta Car`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Relatório de Economia - Consulta Car',
          text: texto,
        });
      } catch (error) {
        // Fallback para clipboard
        navigator.clipboard.writeText(texto);
      }
    } else {
      navigator.clipboard.writeText(texto);
    }
  };

  React.useEffect(() => {
    if (multas.length > 0 && !relatorioAtual) {
      handleGerarRelatorio();
    }
  }, [multas.length]);

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onVoltar}
          className="flex items-center gap-2 px-3 py-2 text-muted hover:text-ink hover:bg-canvas rounded-lg transition"
        >
          <ArrowLeft size={20} />
          Voltar
        </button>
        
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-ink">Relatório de Economia</h3>
          <p className="text-muted">Análise completa e documento para download</p>
        </div>
        
        {relatorioAtual && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleCompartilhar}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition"
            >
              <Share2 size={16} />
              Compartilhar
            </button>
            
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isGeneratingPDF ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Download size={20} />
              )}
              {isGeneratingPDF ? 'Gerando PDF...' : 'Baixar PDF'}
            </button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isCalculating && !relatorioAtual && (
        <div className="text-center py-16">
          <Loader2 size={48} className="text-green-600 mx-auto mb-4 animate-spin" />
          <h4 className="text-lg font-semibold text-ink mb-2">Gerando Relatório...</h4>
          <p className="text-muted">Analisando suas multas e calculando a melhor estratégia</p>
        </div>
      )}

      {/* Relatório Content */}
      {relatorioAtual && (
        <>
          {/* Resumo Executivo */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <h4 className="text-xl font-bold text-green-800 mb-6 text-center flex items-center justify-center gap-2">
              <Target size={24} />
              Resumo Executivo
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <ResumoMetrica
                icon={<FileText size={24} className="text-blue-600" />}
                titulo="Multas Analisadas"
                valor={relatorioAtual.multasAnalisadas.length.toString()}
                subtitulo="Total de infrações"
              />
              
              <ResumoMetrica
                icon={<DollarSign size={24} className="text-red-600" />}
                titulo="Valor Total"
                valor={`R$ ${relatorioAtual.multasAnalisadas.reduce((sum, m) => sum + m.valorOriginal, 0).toFixed(2)}`}
                subtitulo="Sem estratégia"
              />
              
              <ResumoMetrica
                icon={<TrendingUp size={24} className="text-green-600" />}
                titulo="Economia Total"
                valor={`R$ ${relatorioAtual.economiaTotal.toFixed(2)}`}
                subtitulo="Com estratégia otimizada"
              />
              
              <ResumoMetrica
                icon={<Shield size={24} className="text-purple-600" />}
                titulo="Pontos Evitados"
                valor={relatorioAtual.pontosEvitados.toString()}
                subtitulo="Na sua CNH"
              />
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-green-700 mb-2">
                {relatorioAtual.melhorEstrategia}
              </p>
              <p className="text-green-600">
                Economia de {((relatorioAtual.economiaTotal / relatorioAtual.multasAnalisadas.reduce((sum, m) => sum + m.valorOriginal, 0)) * 100).toFixed(1)}% do valor total
              </p>
            </div>
          </div>

          {/* Detalhamento por Multa */}
          <div className="bg-surface border border-ink/8 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-ink mb-6 flex items-center gap-2">
              <FileText size={20} />
              Análise Detalhada por Multa
            </h4>
            
            <div className="space-y-4">
              {relatorioAtual.multasAnalisadas.map((multa, index) => (
                <MultaDetalhada key={multa.id} multa={multa} numero={index + 1} />
              ))}
            </div>
          </div>

          {/* Comparação de Estratégias */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EstrategiaComparacao
              titulo="Estratégia SNE"
              descricao="Pagar todas com 40% de desconto"
              economia={relatorioAtual.economiaSNE}
              cor="green"
              detalhes={[
                'Desconto garantido de 40%',
                'Processo simples e rápido',
                'Pontos aplicados na CNH'
              ]}
            />
            
            <EstrategiaComparacao
              titulo="Estratégia Recurso"
              descricao="Recorrer todas com IA"
              economia={relatorioAtual.economiaRecursos}
              cor="blue"
              detalhes={[
                'Economia máxima se ganhar',
                'Evita pontos na CNH',
                'Processo pode demorar'
              ]}
            />
          </div>

          {/* Recomendações */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
              <CheckCircle2 size={20} />
              Recomendações Personalizadas
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-semibold text-blue-700 mb-3">Ações Imediatas:</h5>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-blue-600">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                    Aderir ao SNE se ainda não tiver
                  </li>
                  <li className="flex items-start gap-2 text-sm text-blue-600">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                    Recorrer multas com alta chance de sucesso
                  </li>
                  <li className="flex items-start gap-2 text-sm text-blue-600">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                    Pagar com desconto as demais multas
                  </li>
                </ul>
              </div>
              
              <div>
                <h5 className="font-semibold text-blue-700 mb-3">Cuidados Importantes:</h5>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-blue-600">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                    Respeitar prazos de recurso
                  </li>
                  <li className="flex items-start gap-2 text-sm text-blue-600">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                    Acompanhar processos de recurso
                  </li>
                  <li className="flex items-start gap-2 text-sm text-blue-600">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                    Não deixar multas vencerem
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Histórico de Relatórios */}
          {relatoriosGerados.length > 1 && (
            <div className="bg-surface border border-ink/8 rounded-2xl p-6">
              <h4 className="text-lg font-semibold text-ink mb-4 flex items-center gap-2">
                <Calendar size={20} />
                Histórico de Relatórios
              </h4>
              
              <div className="space-y-3">
                {relatoriosGerados.slice(0, 5).map((relatorio) => (
                  <div key={relatorio.id} className="flex items-center justify-between p-3 border border-ink/8 rounded-lg">
                    <div>
                      <p className="font-semibold text-ink text-sm">
                        {relatorio.multasAnalisadas.length} multas • R$ {relatorio.economiaTotal.toFixed(2)} economia
                      </p>
                      <p className="text-xs text-muted">
                        {new Date(relatorio.geradoEm).toLocaleDateString('pt-BR')} às {new Date(relatorio.geradoEm).toLocaleTimeString('pt-BR')}
                      </p>
                    </div>
                    
                    <button className="text-sm font-semibold text-brand hover:text-brand-emphasis">
                      Ver Detalhes
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {multas.length === 0 && (
        <div className="text-center py-16">
          <FileText size={48} className="text-muted mx-auto mb-4" />
          <h3 className="text-xl font-bold text-ink mb-2">Nenhuma Multa para Analisar</h3>
          <p className="text-muted mb-6">
            Importe suas multas ou use a calculadora rápida para gerar um relatório.
          </p>
          <button
            onClick={onVoltar}
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition"
          >
            <ArrowLeft size={20} />
            Voltar ao Dashboard
          </button>
        </div>
      )}
    </div>
  );
}

function ResumoMetrica({ 
  icon, 
  titulo, 
  valor, 
  subtitulo 
}: { 
  icon: React.ReactNode; 
  titulo: string; 
  valor: string; 
  subtitulo: string; 
}) {
  return (
    <div className="text-center">
      <div className="flex justify-center mb-2">{icon}</div>
      <h5 className="font-semibold text-ink text-sm">{titulo}</h5>
      <p className="text-xl font-bold text-ink">{valor}</p>
      <p className="text-xs text-muted">{subtitulo}</p>
    </div>
  );
}

function MultaDetalhada({ 
  multa, 
  numero,
  key
}: { 
  multa: MultaCalculadora; 
  numero: number;
  key?: string | number;
}) {
  const economiaSNE = multa.valorOriginal - multa.valorComDescontoSNE;
  const economiaRecurso = multa.chanceSuccessoRecurso > 60 ? multa.valorOriginal : 0;
  const melhorOpcao = economiaRecurso > economiaSNE ? 'recurso' : 'sne';

  return (
    <div className="p-4 border border-ink/8 rounded-xl">
      <div className="flex items-start gap-4">
        <div className="w-8 h-8 bg-brand text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">
          {numero}
        </div>
        
        <div className="flex-1 min-w-0">
          <h6 className="font-semibold text-ink mb-1">{multa.descricao}</h6>
          <p className="text-sm text-muted mb-3">
            {multa.placa} • {multa.orgaoAutuador} • {multa.pontos} pontos
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted font-semibold">Valor Original:</p>
              <p className="font-bold text-ink">R$ {multa.valorOriginal.toFixed(2)}</p>
            </div>
            
            <div>
              <p className="text-muted font-semibold">Com SNE (40%):</p>
              <p className="font-bold text-green-600">
                R$ {multa.valorComDescontoSNE.toFixed(2)}
                <span className="text-xs ml-1">(-R$ {economiaSNE.toFixed(2)})</span>
              </p>
            </div>
            
            <div>
              <p className="text-muted font-semibold">Chance Recurso:</p>
              <p className={`font-bold ${
                multa.chanceSuccessoRecurso >= 60 ? 'text-blue-600' : 'text-amber-600'
              }`}>
                {multa.chanceSuccessoRecurso}%
                {economiaRecurso > 0 && (
                  <span className="text-xs ml-1">(-R$ {economiaRecurso.toFixed(2)})</span>
                )}
              </p>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
            melhorOpcao === 'recurso' 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-green-100 text-green-700'
          }`}>
            {melhorOpcao === 'recurso' ? 'Recorrer' : 'Pagar SNE'}
          </div>
          <p className="text-xs text-muted mt-1">
            Economia: R$ {Math.max(economiaSNE, economiaRecurso).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}

function EstrategiaComparacao({ 
  titulo, 
  descricao, 
  economia, 
  cor, 
  detalhes 
}: { 
  titulo: string; 
  descricao: string; 
  economia: number; 
  cor: 'green' | 'blue'; 
  detalhes: string[]; 
}) {
  const colorClasses = {
    green: 'bg-green-50 border-green-200',
    blue: 'bg-blue-50 border-blue-200',
  };

  const textColorClasses = {
    green: 'text-green-800',
    blue: 'text-blue-800',
  };

  return (
    <div className={`p-6 rounded-2xl border ${colorClasses[cor]}`}>
      <h5 className={`font-bold ${textColorClasses[cor]} mb-2`}>{titulo}</h5>
      <p className="text-sm text-muted mb-4">{descricao}</p>
      
      <div className="mb-4">
        <p className="text-2xl font-bold text-ink">R$ {economia.toFixed(2)}</p>
        <p className="text-sm text-muted">Economia total</p>
      </div>
      
      <ul className="space-y-2">
        {detalhes.map((detalhe, index) => (
          <li key={index} className="flex items-start gap-2 text-sm">
            <CheckCircle2 size={14} className={`mt-0.5 shrink-0 ${
              cor === 'green' ? 'text-green-600' : 'text-blue-600'
            }`} />
            <span className={cor === 'green' ? 'text-green-700' : 'text-blue-700'}>
              {detalhe}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}