import React, { useState } from 'react';
import { FileDown, CheckCircle2, FileText, Download, Share2 } from 'lucide-react';
import { useRecursoStore } from '../../../stores/recursoStore';
import { generateRecursoPDF, generateChecklistPDF } from '../../../services/pdfGenerator';

export function GerarPDFStep() {
  const { currentRecurso, updateRecurso } = useRecursoStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfGenerated, setPdfGenerated] = useState(false);

  const handleGeneratePDF = async () => {
    if (!currentRecurso) return;

    setIsGenerating(true);
    
    try {
      // Gerar PDF do recurso
      const pdfBlob = await generateRecursoPDF(currentRecurso as any);
      
      // Download do arquivo
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recurso_${currentRecurso.ocrData?.numeroAuto || 'multa'}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Marcar como finalizado
      updateRecurso({ status: 'finalizado' });
      setPdfGenerated(true);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateChecklist = async () => {
    if (!currentRecurso?.recorrente) return;

    const documentos = [
      'Cópia da CNH do condutor',
      'Cópia do CRLV do veículo',
      'Cópia do RG e CPF do recorrente',
      'Comprovante de residência',
      'Fotos do local da infração (se aplicável)',
      'Laudo técnico do equipamento (se disponível)',
    ];

    try {
      const checklistBlob = await generateChecklistPDF(documentos, currentRecurso.recorrente.nome);
      
      const url = URL.createObjectURL(checklistBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `checklist_documentos_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao gerar checklist:', error);
    }
  };

  const resumoRecurso = {
    numeroAuto: currentRecurso?.ocrData?.numeroAuto || 'N/A',
    placa: currentRecurso?.ocrData?.placa || 'N/A',
    valor: currentRecurso?.ocrData?.valor || 0,
    argumentos: currentRecurso?.argumentosSelecionados?.length || 0,
    probabilidade: currentRecurso?.iaAnalysis?.probabilidadeSuccesso || 0,
    tipo: currentRecurso?.tipoRecurso === 'defesa_previa' ? 'Defesa Prévia' : 'Recurso à JARI',
  };

  return (
    <div className="space-y-8">
      {/* Título */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-ink mb-3">Gerar PDF do Recurso</h3>
        <p className="text-muted max-w-2xl mx-auto leading-relaxed">
          Seu recurso está pronto! Gere o PDF profissional para apresentar aos órgãos competentes.
        </p>
      </div>

      {/* Resumo do Recurso */}
      <div className="p-6 bg-gradient-to-r from-brand-soft/30 to-surface border border-brand/20 rounded-xl">
        <h4 className="text-lg font-semibold text-ink mb-4 flex items-center gap-2">
          <CheckCircle2 size={20} className="text-green-600" />
          Resumo do Recurso
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-white/50 rounded-lg">
            <p className="text-sm text-muted">Auto de Infração</p>
            <p className="font-semibold text-ink">{resumoRecurso.numeroAuto}</p>
          </div>
          
          <div className="p-4 bg-white/50 rounded-lg">
            <p className="text-sm text-muted">Placa</p>
            <p className="font-semibold text-ink">{resumoRecurso.placa}</p>
          </div>
          
          <div className="p-4 bg-white/50 rounded-lg">
            <p className="text-sm text-muted">Valor</p>
            <p className="font-semibold text-ink">R$ {resumoRecurso.valor.toFixed(2)}</p>
          </div>
          
          <div className="p-4 bg-white/50 rounded-lg">
            <p className="text-sm text-muted">Tipo de Recurso</p>
            <p className="font-semibold text-ink">{resumoRecurso.tipo}</p>
          </div>
          
          <div className="p-4 bg-white/50 rounded-lg">
            <p className="text-sm text-muted">Argumentos</p>
            <p className="font-semibold text-ink">{resumoRecurso.argumentos} selecionados</p>
          </div>
          
          <div className="p-4 bg-white/50 rounded-lg">
            <p className="text-sm text-muted">Probabilidade</p>
            <p className="font-semibold text-ink">{Math.round(resumoRecurso.probabilidade * 100)}%</p>
          </div>
        </div>
      </div>

      {/* Ações Principais */}
      <div className="flex flex-col items-center gap-6">
        {!pdfGenerated ? (
          <button
            onClick={handleGeneratePDF}
            disabled={isGenerating}
            className="flex items-center gap-3 px-8 py-4 bg-brand text-white rounded-2xl font-semibold text-lg hover:bg-brand-emphasis disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
          >
            {isGenerating ? (
              <>
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Gerando PDF...
              </>
            ) : (
              <>
                <FileDown size={24} />
                Gerar PDF do Recurso
              </>
            )}
          </button>
        ) : (
          <div className="text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-green-soft text-green-600 mx-auto mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h4 className="text-lg font-semibold text-ink mb-2">PDF Gerado com Sucesso!</h4>
            <p className="text-muted mb-6">
              Seu recurso foi baixado e está pronto para ser apresentado.
            </p>
          </div>
        )}

        {/* Ações Secundárias */}
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={handleGenerateChecklist}
            className="flex items-center gap-2 px-6 py-3 border border-brand text-brand rounded-lg hover:bg-brand-soft/30 transition font-semibold"
          >
            <FileText size={18} />
            Baixar Checklist
          </button>

          {pdfGenerated && (
            <>
              <button
                onClick={handleGeneratePDF}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition font-semibold"
              >
                <Download size={18} />
                Baixar Novamente
              </button>

              <button className="flex items-center gap-2 px-6 py-3 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold">
                <Share2 size={18} />
                Compartilhar
              </button>
            </>
          )}
        </div>
      </div>

      {/* Próximos Passos */}
      <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl">
        <h4 className="font-semibold text-blue-800 mb-3">Próximos Passos</h4>
        <ol className="text-sm text-blue-700 space-y-2">
          <li>1. Imprima o recurso gerado em papel timbrado (se possível)</li>
          <li>2. Assine o documento no local indicado</li>
          <li>3. Reúna todos os documentos do checklist</li>
          <li>4. Protocole no órgão autuador dentro do prazo legal</li>
          <li>5. Guarde o protocolo de entrega como comprovante</li>
        </ol>
      </div>

      {/* Prazos Importantes */}
      <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl">
        <h4 className="font-semibold text-amber-800 mb-3">⏰ Atenção aos Prazos</h4>
        <ul className="text-sm text-amber-700 space-y-1">
          <li>• <strong>Defesa Prévia:</strong> 15 dias corridos da notificação</li>
          <li>• <strong>Recurso à JARI:</strong> 30 dias corridos da decisão</li>
          <li>• <strong>Recurso ao CETRAN:</strong> 30 dias corridos da decisão da JARI</li>
        </ul>
      </div>

      {/* Disclaimer Final */}
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">
        <strong>Disclaimer Legal:</strong> Este documento foi gerado automaticamente com base nas informações fornecidas. 
        Recomendamos fortemente a revisão por um advogado especializado antes da apresentação. 
        O usuário assume total responsabilidade pelo conteúdo e uso do recurso gerado.
      </div>
    </div>
  );
}