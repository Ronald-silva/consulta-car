import jsPDF from 'jspdf';
import type { RelatorioEconomia } from '../stores/calculadoraStore';

/** Configurações do PDF do relatório de economia */
const RELATORIO_PDF_CONFIG = {
  format: 'a4',
  margins: {
    top: 25,
    right: 20,
    bottom: 20,
    left: 20,
  },
  fontSize: {
    title: 18,
    subtitle: 14,
    body: 11,
    small: 9,
    caption: 8,
  },
  colors: {
    primary: '#059669', // green-600
    success: '#10b981', // green-500
    warning: '#f59e0b', // amber-500
    danger: '#ef4444', // red-500
    gray: '#6b7280',
    lightGray: '#f3f4f6',
  },
};

/** Gerar PDF do relatório de economia */
export async function generateRelatorioEconomiaPDF(relatorio: RelatorioEconomia): Promise<Blob> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  let currentY = RELATORIO_PDF_CONFIG.margins.top;

  // Cabeçalho principal
  currentY = addRelatorioHeader(pdf, currentY, relatorio);
  
  // Resumo executivo
  currentY = addResumoExecutivo(pdf, currentY, relatorio);
  
  // Análise por multa
  currentY = addAnaliseMultas(pdf, currentY, relatorio);
  
  // Comparação de estratégias
  currentY = addComparacaoEstrategias(pdf, currentY, relatorio);
  
  // Recomendações
  currentY = addRecomendacoes(pdf, currentY, relatorio);
  
  // Rodapé
  addRelatorioFooter(pdf);

  return pdf.output('blob');
}

/** Adicionar cabeçalho do relatório */
function addRelatorioHeader(pdf: jsPDF, y: number, relatorio: RelatorioEconomia): number {
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // Fundo do cabeçalho
  pdf.setFillColor(5, 150, 105); // green-600
  pdf.rect(0, 0, pageWidth, 35, 'F');
  
  // Logo e título
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(RELATORIO_PDF_CONFIG.fontSize.title);
  pdf.setFont('helvetica', 'bold');
  pdf.text('CONSULTA CAR', RELATORIO_PDF_CONFIG.margins.left, y);
  
  pdf.setFontSize(RELATORIO_PDF_CONFIG.fontSize.subtitle);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Relatório de Economia em Multas', RELATORIO_PDF_CONFIG.margins.left, y + 8);
  
  // Data do relatório
  pdf.setFontSize(RELATORIO_PDF_CONFIG.fontSize.small);
  const dataRelatorio = new Date(relatorio.geradoEm).toLocaleDateString('pt-BR');
  pdf.text(`Gerado em: ${dataRelatorio}`, pageWidth - 60, y);
  pdf.text(`ID: ${relatorio.id.slice(-8)}`, pageWidth - 60, y + 6);
  
  // Linha separadora
  pdf.setTextColor(0, 0, 0);
  y += 20;
  pdf.setDrawColor(200, 200, 200);
  pdf.line(RELATORIO_PDF_CONFIG.margins.left, y, pageWidth - RELATORIO_PDF_CONFIG.margins.right, y);
  
  return y + 10;
}

/** Adicionar resumo executivo */
function addResumoExecutivo(pdf: jsPDF, y: number, relatorio: RelatorioEconomia): number {
  y = addSectionTitle(pdf, y, 'RESUMO EXECUTIVO');
  
  const valorTotal = relatorio.multasAnalisadas.reduce((sum, m) => sum + m.valorOriginal, 0);
  const percentualEconomia = valorTotal > 0 ? (relatorio.economiaTotal / valorTotal) * 100 : 0;
  
  // Box de destaque
  pdf.setFillColor(5, 150, 105);
  pdf.setTextColor(255, 255, 255);
  pdf.rect(RELATORIO_PDF_CONFIG.margins.left, y, 170, 20, 'F');
  
  pdf.setFontSize(RELATORIO_PDF_CONFIG.fontSize.subtitle);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`ECONOMIA TOTAL: R$ ${relatorio.economiaTotal.toFixed(2)}`, RELATORIO_PDF_CONFIG.margins.left + 5, y + 8);
  pdf.setFontSize(RELATORIO_PDF_CONFIG.fontSize.body);
  pdf.text(`${percentualEconomia.toFixed(1)}% do valor total • ${relatorio.melhorEstrategia}`, RELATORIO_PDF_CONFIG.margins.left + 5, y + 15);
  
  y += 25;
  pdf.setTextColor(0, 0, 0);
  
  // Métricas principais
  pdf.setFontSize(RELATORIO_PDF_CONFIG.fontSize.body);
  pdf.setFont('helvetica', 'bold');
  
  const metricas = [
    ['Multas Analisadas:', relatorio.multasAnalisadas.length.toString()],
    ['Valor Total Original:', `R$ ${valorTotal.toFixed(2)}`],
    ['Economia com SNE:', `R$ ${relatorio.economiaSNE.toFixed(2)}`],
    ['Economia com Recursos:', `R$ ${relatorio.economiaRecursos.toFixed(2)}`],
    ['Pontos Evitados na CNH:', relatorio.pontosEvitados.toString()],
  ];
  
  metricas.forEach((metrica, index) => {
    const yPos = y + (index * 6);
    pdf.setFont('helvetica', 'bold');
    pdf.text(metrica[0], RELATORIO_PDF_CONFIG.margins.left, yPos);
    pdf.setFont('helvetica', 'normal');
    pdf.text(metrica[1], RELATORIO_PDF_CONFIG.margins.left + 60, yPos);
  });
  
  return y + (metricas.length * 6) + 10;
}

/** Adicionar análise detalhada das multas */
function addAnaliseMultas(pdf: jsPDF, y: number, relatorio: RelatorioEconomia): number {
  y = addSectionTitle(pdf, y, 'ANÁLISE DETALHADA POR MULTA');
  
  pdf.setFontSize(RELATORIO_PDF_CONFIG.fontSize.body);
  
  relatorio.multasAnalisadas.forEach((multa, index) => {
    // Verificar se precisa de nova página
    if (y > 250) {
      pdf.addPage();
      y = RELATORIO_PDF_CONFIG.margins.top;
    }
    
    const economiaSNE = multa.valorOriginal - multa.valorComDescontoSNE;
    const economiaRecurso = multa.chanceSuccessoRecurso > 60 ? multa.valorOriginal : 0;
    const melhorOpcao = economiaRecurso > economiaSNE ? 'Recorrer com IA' : 'Pagar com SNE';
    const melhorEconomia = Math.max(economiaSNE, economiaRecurso);
    
    // Cabeçalho da multa
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(5, 150, 105);
    pdf.text(`${index + 1}. ${multa.descricao}`, RELATORIO_PDF_CONFIG.margins.left, y);
    
    y += 6;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(RELATORIO_PDF_CONFIG.fontSize.small);
    pdf.text(`Placa: ${multa.placa} • Órgão: ${multa.orgaoAutuador} • Pontos: ${multa.pontos}`, RELATORIO_PDF_CONFIG.margins.left, y);
    
    y += 5;
    pdf.setFontSize(RELATORIO_PDF_CONFIG.fontSize.body);
    
    // Dados da multa
    const dadosMulta = [
      ['Valor Original:', `R$ ${multa.valorOriginal.toFixed(2)}`],
      ['Com SNE (40%):', `R$ ${multa.valorComDescontoSNE.toFixed(2)} (economia: R$ ${economiaSNE.toFixed(2)})`],
      ['Chance Recurso:', `${multa.chanceSuccessoRecurso}% (economia potencial: R$ ${economiaRecurso.toFixed(2)})`],
      ['Recomendação:', `${melhorOpcao} - Economia: R$ ${melhorEconomia.toFixed(2)}`],
    ];
    
    dadosMulta.forEach((dado) => {
      pdf.setFont('helvetica', 'bold');
      pdf.text(dado[0], RELATORIO_PDF_CONFIG.margins.left + 5, y);
      pdf.setFont('helvetica', 'normal');
      pdf.text(dado[1], RELATORIO_PDF_CONFIG.margins.left + 45, y);
      y += 5;
    });
    
    y += 5; // Espaço entre multas
  });
  
  return y + 5;
}

/** Adicionar comparação de estratégias */
function addComparacaoEstrategias(pdf: jsPDF, y: number, relatorio: RelatorioEconomia): number {
  // Verificar se precisa de nova página
  if (y > 200) {
    pdf.addPage();
    y = RELATORIO_PDF_CONFIG.margins.top;
  }
  
  y = addSectionTitle(pdf, y, 'COMPARAÇÃO DE ESTRATÉGIAS');
  
  pdf.setFontSize(RELATORIO_PDF_CONFIG.fontSize.body);
  
  // Estratégia SNE
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(5, 150, 105);
  pdf.text('ESTRATÉGIA 1: Pagar todas com SNE (40% desconto)', RELATORIO_PDF_CONFIG.margins.left, y);
  
  y += 6;
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  
  const dadosSNE = [
    ['Economia Total:', `R$ ${relatorio.economiaSNE.toFixed(2)}`],
    ['Vantagens:', 'Desconto garantido, processo simples, sem risco'],
    ['Desvantagens:', 'Pontos aplicados na CNH, admite a infração'],
  ];
  
  dadosSNE.forEach((dado) => {
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${dado[0]}`, RELATORIO_PDF_CONFIG.margins.left, y);
    pdf.setFont('helvetica', 'normal');
    pdf.text(dado[1], RELATORIO_PDF_CONFIG.margins.left + 35, y);
    y += 5;
  });
  
  y += 5;
  
  // Estratégia Recurso
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(59, 130, 246); // blue-500
  pdf.text('ESTRATÉGIA 2: Recorrer todas com IA', RELATORIO_PDF_CONFIG.margins.left, y);
  
  y += 6;
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  
  const dadosRecurso = [
    ['Economia Potencial:', `R$ ${relatorio.economiaRecursos.toFixed(2)}`],
    ['Vantagens:', 'Economia máxima, evita pontos, recurso automático'],
    ['Desvantagens:', 'Processo demorado, risco de perder'],
  ];
  
  dadosRecurso.forEach((dado) => {
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${dado[0]}`, RELATORIO_PDF_CONFIG.margins.left, y);
    pdf.setFont('helvetica', 'normal');
    pdf.text(dado[1], RELATORIO_PDF_CONFIG.margins.left + 35, y);
    y += 5;
  });
  
  return y + 10;
}

/** Adicionar recomendações */
function addRecomendacoes(pdf: jsPDF, y: number, relatorio: RelatorioEconomia): number {
  // Verificar se precisa de nova página
  if (y > 220) {
    pdf.addPage();
    y = RELATORIO_PDF_CONFIG.margins.top;
  }
  
  y = addSectionTitle(pdf, y, 'RECOMENDAÇÕES PERSONALIZADAS');
  
  pdf.setFontSize(RELATORIO_PDF_CONFIG.fontSize.body);
  
  // Recomendação principal
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(5, 150, 105);
  pdf.text(`ESTRATÉGIA RECOMENDADA: ${relatorio.melhorEstrategia}`, RELATORIO_PDF_CONFIG.margins.left, y);
  
  y += 8;
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  
  // Ações imediatas
  pdf.setFont('helvetica', 'bold');
  pdf.text('AÇÕES IMEDIATAS:', RELATORIO_PDF_CONFIG.margins.left, y);
  y += 6;
  
  const acoesImediatas = [
    'Aderir ao SNE se ainda não tiver (40% de desconto automático)',
    'Recorrer multas com chance de sucesso acima de 60%',
    'Pagar com desconto SNE as multas com baixa chance de recurso',
    'Não deixar nenhuma multa vencer (evitar juros de 20%)',
  ];
  
  pdf.setFont('helvetica', 'normal');
  acoesImediatas.forEach((acao) => {
    pdf.text(`• ${acao}`, RELATORIO_PDF_CONFIG.margins.left + 5, y);
    y += 5;
  });
  
  y += 5;
  
  // Cuidados importantes
  pdf.setFont('helvetica', 'bold');
  pdf.text('CUIDADOS IMPORTANTES:', RELATORIO_PDF_CONFIG.margins.left, y);
  y += 6;
  
  const cuidados = [
    'Respeitar prazos de recurso (geralmente 15 dias)',
    'Acompanhar andamento dos processos de recurso',
    'Manter documentação organizada (CNH, CRLV, comprovantes)',
    'Verificar regularmente o status das multas nos portais oficiais',
  ];
  
  pdf.setFont('helvetica', 'normal');
  cuidados.forEach((cuidado) => {
    pdf.text(`• ${cuidado}`, RELATORIO_PDF_CONFIG.margins.left + 5, y);
    y += 5;
  });
  
  return y + 10;
}

/** Adicionar título de seção */
function addSectionTitle(pdf: jsPDF, y: number, title: string): number {
  pdf.setFontSize(RELATORIO_PDF_CONFIG.fontSize.subtitle);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(5, 150, 105);
  pdf.text(title, RELATORIO_PDF_CONFIG.margins.left, y);
  
  // Linha sob o título
  pdf.setDrawColor(5, 150, 105);
  pdf.line(RELATORIO_PDF_CONFIG.margins.left, y + 2, RELATORIO_PDF_CONFIG.margins.left + 60, y + 2);
  
  return y + 10;
}

/** Adicionar rodapé do relatório */
function addRelatorioFooter(pdf: jsPDF): void {
  const pageCount = pdf.getNumberOfPages();
  
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Linha separadora
    pdf.setDrawColor(200, 200, 200);
    pdf.line(RELATORIO_PDF_CONFIG.margins.left, pageHeight - 25, pageWidth - RELATORIO_PDF_CONFIG.margins.right, pageHeight - 25);
    
    pdf.setFontSize(RELATORIO_PDF_CONFIG.fontSize.caption);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(107, 114, 128);
    
    // Disclaimer
    const disclaimer = 'Este relatório é informativo e baseado em análise automatizada. Sempre confirme informações nos portais oficiais.';
    pdf.text(disclaimer, RELATORIO_PDF_CONFIG.margins.left, pageHeight - 15);
    
    // Número da página
    const pageText = `Página ${i} de ${pageCount}`;
    const pageTextWidth = pdf.getTextWidth(pageText);
    pdf.text(pageText, pageWidth - RELATORIO_PDF_CONFIG.margins.right - pageTextWidth, pageHeight - 15);
    
    // Data/hora de geração
    const timestamp = new Date().toLocaleString('pt-BR');
    pdf.text(`Consulta Car • ${timestamp}`, RELATORIO_PDF_CONFIG.margins.left, pageHeight - 8);
  }
}