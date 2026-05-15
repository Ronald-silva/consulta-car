import React, { useEffect, useState } from 'react';
import { Shield, CheckCircle2, AlertTriangle, X, RefreshCw, Info } from 'lucide-react';
import { useRecursoStore } from '../../../stores/recursoStore';
import { consultarInmetro, isRadarMulta, getEquipamentoInfo } from '../../../services/inmetroService';
import type { InmetroResult } from '../../../types';

export function InmetroCheckStep() {
  const { 
    currentRecurso, 
    setInmetroResult, 
    setWizardLoading, 
    setWizardError 
  } = useRecursoStore();

  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<InmetroResult | null>(currentRecurso?.inmetroResult || null);
  const [equipamentoInfo, setEquipamentoInfo] = useState<any>(null);

  const ocrData = currentRecurso?.ocrData;
  const isRadar = isRadarMulta(ocrData?.codigoInfracao, ocrData?.descricaoInfracao, ocrData?.equipamento);

  useEffect(() => {
    if (isRadar && ocrData?.equipamento && !result && !isChecking) {
      handleCheckInmetro();
    }
    
    if (ocrData?.equipamento) {
      setEquipamentoInfo(getEquipamentoInfo(ocrData.equipamento));
    }
  }, [isRadar, ocrData?.equipamento]);

  const handleCheckInmetro = async () => {
    if (!ocrData?.equipamento) return;

    setIsChecking(true);
    setWizardLoading(true);
    setWizardError(undefined);

    try {
      const inmetroResult = await consultarInmetro(ocrData.equipamento, ocrData.local);
      setResult(inmetroResult);
      setInmetroResult(inmetroResult);
    } catch (error) {
      console.error('Erro na consulta Inmetro:', error);
      setWizardError('Falha ao consultar Inmetro. Tente novamente.');
    } finally {
      setIsChecking(false);
      setWizardLoading(false);
    }
  };

  const handleSkip = () => {
    // Pular verificação para multas que não são de radar
    const skipResult: InmetroResult = {
      status: 'nao_encontrado',
      observacoes: 'Verificação não aplicável para este tipo de infração',
    };
    setResult(skipResult);
    setInmetroResult(skipResult);
  };

  const getStatusIcon = (status: InmetroResult['status']) => {
    switch (status) {
      case 'valido':
        return <CheckCircle2 size={24} className="text-green-600" />;
      case 'irregular':
      case 'reprovado':
        return <X size={24} className="text-red-600" />;
      default:
        return <AlertTriangle size={24} className="text-amber-600" />;
    }
  };

  const getStatusColor = (status: InmetroResult['status']) => {
    switch (status) {
      case 'valido':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'irregular':
      case 'reprovado':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-amber-50 border-amber-200 text-amber-800';
    }
  };

  const getStatusText = (status: InmetroResult['status']) => {
    switch (status) {
      case 'valido':
        return 'Equipamento Válido';
      case 'irregular':
        return 'Equipamento Irregular';
      case 'reprovado':
        return 'Equipamento Reprovado';
      default:
        return 'Equipamento Não Encontrado';
    }
  };

  return (
    <div className="space-y-6">
      {/* Título e Descrição */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-ink mb-3">Verificação Inmetro</h3>
        <p className="text-muted max-w-2xl mx-auto leading-relaxed">
          {isRadar 
            ? 'Verificando se o equipamento de medição possui certificação válida do Inmetro.'
            : 'Esta verificação é aplicável apenas para multas de radar. Você pode prosseguir.'
          }
        </p>
      </div>

      {!isRadar ? (
        /* Não é multa de radar */
        <div className="text-center py-12">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-soft text-blue-600 mx-auto mb-6">
            <Info size={32} />
          </div>
          <h4 className="text-lg font-semibold text-ink mb-2">Verificação não necessária</h4>
          <p className="text-muted mb-6 max-w-md mx-auto">
            Esta multa não parece ser de equipamento de medição (radar). 
            A verificação Inmetro não se aplica.
          </p>
          <button
            onClick={handleSkip}
            className="px-6 py-3 bg-brand text-white rounded-lg hover:bg-brand-emphasis transition font-semibold"
          >
            Continuar sem Verificação
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Informações do Equipamento */}
          {equipamentoInfo && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <h4 className="font-semibold text-blue-800 mb-2">
                Equipamento Identificado: {equipamentoInfo.tipo}
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                {equipamentoInfo.observacoes.map((obs: string, index: number) => (
                  <li key={index}>• {obs}</li>
                ))}
              </ul>
              <p className="text-sm text-blue-600 mt-2">
                Tolerância padrão: {equipamentoInfo.tolerancia} km/h
              </p>
            </div>
          )}

          {/* Status da Verificação */}
          {isChecking && (
            <div className="p-6 bg-brand-soft/20 border border-brand/20 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-white">
                  <Shield size={24} className="animate-pulse" />
                </div>
                <div>
                  <h4 className="font-semibold text-ink mb-1">Consultando base do Inmetro...</h4>
                  <p className="text-sm text-muted">
                    Verificando certificação do equipamento: {ocrData?.equipamento}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Resultado da Verificação */}
          {result && !isChecking && (
            <div className={`p-6 rounded-xl border ${getStatusColor(result.status)}`}>
              <div className="flex items-start gap-4">
                <div className="shrink-0">
                  {getStatusIcon(result.status)}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-lg mb-2">
                    {getStatusText(result.status)}
                  </h4>
                  
                  {result.observacoes && (
                    <p className="mb-3">{result.observacoes}</p>
                  )}

                  {result.certificado && (
                    <div className="space-y-1 text-sm">
                      <p><strong>Certificado:</strong> {result.certificado}</p>
                      {result.dataVencimento && (
                        <p><strong>Válido até:</strong> {new Date(result.dataVencimento).toLocaleDateString('pt-BR')}</p>
                      )}
                    </div>
                  )}

                  {/* Impacto no Recurso */}
                  <div className="mt-4 p-3 bg-white/50 rounded-lg">
                    <h5 className="font-semibold mb-2">Impacto no seu recurso:</h5>
                    {result.status === 'irregular' || result.status === 'reprovado' ? (
                      <p className="text-sm">
                        ✅ <strong>Argumento forte:</strong> Equipamento irregular pode invalidar a multa. 
                        Este será um ponto central na sua defesa.
                      </p>
                    ) : result.status === 'valido' ? (
                      <p className="text-sm">
                        ⚠️ <strong>Equipamento válido:</strong> Será necessário buscar outros argumentos 
                        como sinalização inadequada ou vícios formais.
                      </p>
                    ) : (
                      <p className="text-sm">
                        🔍 <strong>Equipamento não encontrado:</strong> Pode ser usado como argumento 
                        sobre a falta de comprovação da certificação.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ações */}
          {!result && !isChecking && (
            <div className="text-center">
              <button
                onClick={handleCheckInmetro}
                className="flex items-center gap-3 mx-auto px-8 py-4 bg-brand text-white rounded-2xl font-semibold text-lg hover:bg-brand-emphasis transition shadow-lg"
              >
                <Shield size={24} />
                Verificar no Inmetro
              </button>
            </div>
          )}

          {result && (
            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  setResult(null);
                  handleCheckInmetro();
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-muted border border-ink/20 rounded-lg hover:bg-canvas transition"
              >
                <RefreshCw size={16} />
                Verificar Novamente
              </button>
            </div>
          )}
        </div>
      )}

      {/* Informações Adicionais */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
        <h4 className="font-semibold text-gray-800 mb-2">Sobre a Verificação Inmetro</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• O Inmetro certifica equipamentos de medição de velocidade</li>
          <li>• Equipamentos irregulares podem invalidar a autuação</li>
          <li>• A verificação é obrigatória por lei (Resolução CONTRAN 798/2020)</li>
          <li>• Certificados vencidos tornam a medição inválida</li>
        </ul>
      </div>
    </div>
  );
}