import React, { useEffect, useState } from 'react';
import { Brain, Zap, CheckCircle2, AlertTriangle, TrendingUp, Settings } from 'lucide-react';
import { useRecursoStore } from '../../../stores/recursoStore';
import { analyzeMultaWithIA } from '../../../services/iaService';
import { getSettings } from '../../../utils/settings';
import { ApiKeyModal } from '../../../components/ApiKeyModal';
import type { IaAnalysis } from '../../../types';

export function AnaliseIAStep() {
  const { 
    currentRecurso, 
    setIaAnalysis, 
    setWizardLoading, 
    setWizardError 
  } = useRecursoStore();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<IaAnalysis | null>(currentRecurso?.iaAnalysis || null);
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  useEffect(() => {
    const settings = getSettings();
    setApiKeyConfigured(!!settings.geminiApiKey);
    
    if (settings.geminiApiKey && currentRecurso?.ocrData && !analysis && !isAnalyzing) {
      handleAnalyze();
    }
  }, [currentRecurso?.ocrData]);

  const handleAnalyze = async () => {
    if (!currentRecurso?.ocrData) return;

    const settings = getSettings();
    if (!settings.geminiApiKey) {
      setWizardError('Chave da API Gemini não configurada. Configure nas configurações.');
      return;
    }

    setIsAnalyzing(true);
    setWizardLoading(true);
    setWizardError(undefined);

    try {
      const iaAnalysis = await analyzeMultaWithIA(
        currentRecurso.ocrData,
        currentRecurso.inmetroResult,
        settings.geminiApiKey
      );

      setAnalysis(iaAnalysis);
      setIaAnalysis(iaAnalysis);
    } catch (error) {
      console.error('Erro na análise com IA:', error);
      setWizardError('Falha na análise com IA. Verifique sua chave de API ou tente novamente.');
    } finally {
      setIsAnalyzing(false);
      setWizardLoading(false);
    }
  };

  const getForcaColor = (forca: string) => {
    switch (forca) {
      case 'forte': return 'text-green-600 bg-green-50 border-green-200';
      case 'medio': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'fraco': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getForcaIcon = (forca: string) => {
    switch (forca) {
      case 'forte': return '🟢';
      case 'medio': return '🟡';
      case 'fraco': return '🔴';
      default: return '⚪';
    }
  };

  return (
    <div className="space-y-6">
      {/* Título e Descrição */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-ink mb-3">Análise com IA</h3>
        <p className="text-muted max-w-2xl mx-auto leading-relaxed">
          Nossa IA especializada em direito de trânsito analisará sua multa e sugerirá 
          os melhores argumentos jurídicos para seu recurso.
        </p>
      </div>

      {!apiKeyConfigured ? (
        /* API Key não configurada */
        <div className="text-center py-12">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-soft text-amber-600 mx-auto mb-6">
            <Settings size={32} />
          </div>
          <h4 className="text-lg font-semibold text-ink mb-2">API Key necessária</h4>
          <p className="text-muted mb-6 max-w-md mx-auto">
            Para usar a análise com IA, configure sua chave da API Gemini nas configurações do aplicativo.
          </p>
          <button 
            onClick={() => setShowApiKeyModal(true)}
            className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-semibold"
          >
            Configurar API Key
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Status da Análise */}
          {isAnalyzing && (
            <div className="p-6 bg-brand-soft/20 border border-brand/20 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-white">
                  <Brain size={24} className="animate-pulse" />
                </div>
                <div>
                  <h4 className="font-semibold text-ink mb-1">Analisando com IA...</h4>
                  <p className="text-sm text-muted">
                    Identificando argumentos jurídicos e calculando probabilidade de sucesso
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Resultados da Análise */}
          {analysis && !isAnalyzing && (
            <div className="space-y-6">
              {/* Probabilidade de Sucesso */}
              <div className="p-6 bg-gradient-to-r from-brand-soft/30 to-surface border border-brand/20 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand text-white text-xl font-bold">
                    {Math.round(analysis.probabilidadeSuccesso * 100)}%
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-ink mb-1">
                      Probabilidade de Sucesso
                    </h4>
                    <p className="text-muted">
                      {analysis.probabilidadeSuccesso > 0.7 
                        ? 'Alta chance de sucesso no recurso'
                        : analysis.probabilidadeSuccesso > 0.4
                        ? 'Chance moderada de sucesso'
                        : 'Chance baixa, mas vale tentar'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Argumentos Identificados */}
              <div>
                <h4 className="text-lg font-semibold text-ink mb-4 flex items-center gap-2">
                  <TrendingUp size={20} className="text-brand" />
                  Argumentos Jurídicos Identificados
                </h4>
                
                <div className="space-y-4">
                  {analysis.argumentos.map((argumento, index) => (
                    <div key={index} className={`p-4 rounded-xl border ${getForcaColor(argumento.forca)}`}>
                      <div className="flex items-start gap-3">
                        <span className="text-lg">{getForcaIcon(argumento.forca)}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h5 className="font-semibold">{argumento.tipo}</h5>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getForcaColor(argumento.forca)}`}>
                              {argumento.forca.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm mb-2">{argumento.descricao}</p>
                          <p className="text-xs opacity-80">
                            <strong>Fundamentação:</strong> {argumento.fundamentacao}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recomendações */}
              {analysis.recomendacoes.length > 0 && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <h5 className="font-semibold text-blue-800 mb-2">Recomendações da IA</h5>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {analysis.recomendacoes.map((rec, index) => (
                      <li key={index}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Riscos */}
              {analysis.riscos.length > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <h5 className="font-semibold text-amber-800 mb-2">Riscos e Cuidados</h5>
                  <ul className="text-sm text-amber-700 space-y-1">
                    {analysis.riscos.map((risco, index) => (
                      <li key={index}>⚠️ {risco}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Texto Base */}
              {analysis.textoBase && (
                <details className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                  <summary className="cursor-pointer font-semibold text-gray-700 mb-2">
                    Ver texto base sugerido pela IA
                  </summary>
                  <div className="text-sm text-gray-600 whitespace-pre-wrap bg-white p-3 rounded border mt-2">
                    {analysis.textoBase}
                  </div>
                </details>
              )}
            </div>
          )}

          {/* Ações */}
          {!analysis && !isAnalyzing && (
            <div className="text-center">
              <button
                onClick={handleAnalyze}
                className="flex items-center gap-3 mx-auto px-8 py-4 bg-brand text-white rounded-2xl font-semibold text-lg hover:bg-brand-emphasis transition shadow-lg"
              >
                <Brain size={24} />
                Analisar com IA
              </button>
            </div>
          )}

          {analysis && (
            <div className="flex justify-center">
              <button
                onClick={() => {
                  setAnalysis(null);
                  handleAnalyze();
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-brand border border-brand rounded-lg hover:bg-brand-soft/30 transition"
              >
                <Zap size={16} />
                Analisar Novamente
              </button>
            </div>
          )}
        </div>
      )}

      {/* Disclaimer */}
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">
        <strong>Importante:</strong> Esta análise é gerada por IA e tem caráter informativo. 
        Não substitui a orientação de um advogado especializado. Sempre consulte um profissional 
        antes de apresentar recursos em processos administrativos.
      </div>

      {/* Modal de API Key */}
      <ApiKeyModal
        open={showApiKeyModal}
        onClose={() => {
          setShowApiKeyModal(false);
          // Recheck API key after modal closes
          const settings = getSettings();
          setApiKeyConfigured(!!settings.geminiApiKey);
        }}
      />
    </div>
  );
}