import jsPDF from 'jspdf';
import type { LaudoVeicular } from '../types';

/** Configurações do PDF do laudo */
const LAUDO_PDF_CONFIG = {
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
    primary: '#0d9488',
    success: '#059669',
    warning: '#d97706',
    danger: '#dc2626',
    gray: '#6b7280',
    lightGray: '#f3f4f6',
  },
};

/** Gerar PDF do laudo veicular */
export async function generateLaudoPDF(laudo: LaudoVeicular): Promise<Blob> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  let currentY = LAUDO_PDF_CONFIG.margins.top;

  // Cabeçalho principal
  currentY = addLaudoHeader(pdf, currentY, laudo);
  
  // Dados do veículo
  currentY = addVehicleData(pdf, currentY, laudo);
  
  // Análise de risco
  currentY = addRiskAnalysis(pdf, currentY, laudo);
  
  // Multas e débitos
  currentY = addMultasDebitos(pdf, currentY, laudo);
  
  // Restrições
  currentY = addRestricoes(pdf, currentY, laudo);
  
  // Recalls
  currentY = addRecalls(pdf, currentY, laudo);
  
  // Sugestão de preço
  currentY = addSugestaoPreco(pdf, currentY, laudo);
  
  // Conclusão e recomendação
  currentY = addConclusao(pdf, currentY, laudo);
  
  // Rodapé
  addLaudoFooter(pdf);

  return pdf.output('blob');
}

/** Adicionar cabeçalho do laudo */
function addLaudoHeader(pdf: jsPDF, y: number, laudo: LaudoVeicular): number {
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // Fundo do cabeçalho
  pdf.setFillColor(13, 148, 136); // brand color
  pdf.rect(0, 0, pageWidth, 35, 'F');
  
  // Logo e título
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(LAUDO_PDF_CONFIG.fontSize.title);
  pdf.setFont('helvetica', 'bold');
  pdf.text('CONSULTA CAR', LAUDO_PDF_CONFIG.margins.left, y);
  
  pdf.setFontSize(LAUDO_PDF_CONFIG.fontSize.subtitle);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Laudo Veicular Profissional', LAUDO_PDF_CONFIG.margins.left, y + 8);
  
  // Número do laudo e data
  pdf.setFontSize(LAUDO_PDF_CONFIG.fontSize.small);
  const dataLaudo = new Date(laudo.createdAt).toLocaleDateString('pt-BR');
  pdf.text(`Laudo Nº: ${laudo.numeroLaudo}`, pageWidth - 60, y);
  pdf.text(`Data: ${dataLaudo}`, pageWidth - 60, y + 6);
  
  // Linha separadora
  pdf.setTextColor(0, 0, 0);
  y += 20;
  pdf.setDrawColor(200, 200, 200);
  pdf.line(LAUDO_PDF_CONFIG.margins.left, y, pageWidth - LAUDO_PDF_CONFIG.margins.right, y);
  
  return y + 10;
}

/** Adicionar dados do veículo */
function addVehicleData(pdf: jsPDF, y: number, laudo: LaudoVeicular): number {
  const { veiculo } = laudo.consulta;
  
  // Título da seção
  y = addSectionTitle(pdf, y, 'DADOS DO VEÍCULO');
  
  // Grid de informações
  const dados = [
    ['Placa:', veiculo.placa, 'RENAVAM:', veiculo.renavam],
    ['Marca/Modelo:', `${veiculo.marca} ${veiculo.modelo}`, 'Ano:', `${veiculo.anoFabricacao}/${veiculo.anoModelo}`],
    ['Cor:', veiculo.cor, 'Combustível:', veiculo.combustivel],
    ['Categoria:', veiculo.categoria, 'Município/UF:', `${veiculo.municipio}/${veiculo.uf}`],
  ];
  
  if (veiculo.chassi) {
    dados.push(['Chassi:', veiculo.chassi.slice(-8), '', '']); // Últimos 8 dígitos por segurança
  }
  
  pdf.setFontSize(LAUDO_PDF_CONFIG.fontSize.body);
  
  dados.forEach((linha, index) => {
    const yPos = y + (index * 8);
    
    // Coluna 1
    pdf.setFont('helvetica', 'bold');
    pdf.text(linha[0], LAUDO_PDF_CONFIG.margins.left, yPos);
    pdf.setFont('helvetica', 'normal');
    pdf.text(linha[1], LAUDO_PDF_CONFIG.margins.left + 35, yPos);
    
    // Coluna 2 (se houver)
    if (linha[2]) {
      pdf.setFont('helvetica', 'bold');
      pdf.text(linha[2], LAUDO_PDF_CONFIG.margins.left + 100, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(linha[3], LAUDO_PDF_CONFIG.margins.left + 135, yPos);
    }
  });
  
  return y + (dados.length * 8) + 10;
}

/** Adicionar análise de risco */
function addRiskAnalysis(pdf: jsPDF, y: number, laudo: LaudoVeicular): number {
  const { analiseRisco } = laudo;
  
  y = addSectionTitle(pdf, y, 'ANÁLISE DE RISCO');
  
  // Box de risco com cor
  const riskColors = {
    baixo: [5, 150, 105], // green
    medio: [217, 119, 6], // orange
    alto: [220, 38, 38], // red
  };
  
  const color = riskColors[analiseRisco.nivel];
  pdf.setFillColor(color[0], color[1], color[2]);
  pdf.setTextColor(255, 255, 255);
  
  // Retângulo de risco
  pdf.rect(LAUDO_PDF_CONFIG.margins.left, y, 170, 15, 'F');
  
  pdf.setFontSize(LAUDO_PDF_CONFIG.fontSize.subtitle);
  pdf.setFont('helvetica', 'bold');
  const riskText = `RISCO ${analiseRisco.nivel.toUpperCase()} - SCORE: ${analiseRisco.pontuacao}/100`;
  pdf.text(riskText, LAUDO_PDF_CONFIG.margins.left + 5, y + 10);
  
  y += 20;
  pdf.setTextColor(0, 0, 0);
  
  // Fatores positivos
  if (analiseRisco.fatoresPositivos.length > 0) {
    pdf.setFontSize(LAUDO_PDF_CONFIG.fontSize.body);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(5, 150, 105);
    pdf.text('✓ PONTOS POSITIVOS:', LAUDO_PDF_CONFIG.margins.left, y);
    
    y += 6;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    
    analiseRisco.fatoresPositivos.forEach((fator) => {
      pdf.text(`• ${fator}`, LAUDO_PDF_CONFIG.margins.left + 5, y);
      y += 5;
    });
    
    y += 3;
  }
  
  // Fatores negativos
  if (analiseRisco.fatoresNegativos.length > 0) {
    pdf.setFontSize(LAUDO_PDF_CONFIG.fontSize.body);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(220, 38, 38);
    pdf.text('⚠ PONTOS DE ATENÇÃO:', LAUDO_PDF_CONFIG.margins.left, y);
    
    y += 6;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    
    analiseRisco.fatoresNegativos.forEach((fator) => {
      pdf.text(`• ${fator}`, LAUDO_PDF_CONFIG.margins.left + 5, y);
      y += 5;
    });
    
    y += 3;
  }
  
  return y + 5;
}

/** Adicionar multas e débitos */
function addMultasDebitos(pdf: jsPDF, y: number, laudo: LaudoVeicular): number {
  const { multas, debitos } = laudo.consulta;
  
  y = addSectionTitle(pdf, y, 'MULTAS E DÉBITOS');
  
  // Resumo
  const totalMultas = multas.reduce((sum, m) => sum + m.valor, 0);
  const totalDebitos = debitos.filter(d => d.status !== 'pago').reduce((sum, d) => sum + d.valor, 0);
  const totalGeral = totalMultas + totalDebitos;
  
  pdf.setFontSize(LAUDO_PDF_CONFIG.fontSize.body);
  pdf.setFont('helvetica', 'bold');
  
  if (totalGeral === 0) {
    pdf.setTextColor(5, 150, 105);
    pdf.text('✓ SEM PENDÊNCIAS FINANCEIRAS', LAUDO_PDF_CONFIG.margins.left, y);
    return y + 10;
  }
  
  pdf.setTextColor(0, 0, 0);
  pdf.text(`Total de Multas: R$ ${totalMultas.toFixed(2)} (${multas.length} multa(s))`, LAUDO_PDF_CONFIG.margins.left, y);
  y += 6;
  pdf.text(`Total de Débitos: R$ ${totalDebitos.toFixed(2)} (${debitos.filter(d => d.status !== 'pago').length} débito(s))`, LAUDO_PDF_CONFIG.margins.left, y);
  y += 6;
  
  pdf.setTextColor(220, 38, 38);
  pdf.text(`TOTAL GERAL: R$ ${totalGeral.toFixed(2)}`, LAUDO_PDF_CONFIG.margins.left, y);
  
  return y + 15;
}

/** Adicionar restrições */
function addRestricoes(pdf: jsPDF, y: number, laudo: LaudoVeicular): number {
  const { restricoes } = laudo.consulta;
  
  y = addSectionTitle(pdf, y, 'RESTRIÇÕES');
  
  pdf.setFontSize(LAUDO_PDF_CONFIG.fontSize.body);
  
  if (restricoes.length === 0) {
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(5, 150, 105);
    pdf.text('✓ SEM RESTRIÇÕES', LAUDO_PDF_CONFIG.margins.left, y);
    return y + 10;
  }
  
  pdf.setTextColor(0, 0, 0);
  restricoes.forEach((restricao, index) => {
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(220, 38, 38);
    pdf.text(`⚠ ${restricao.tipo.toUpperCase().replace('_', ' ')}`, LAUDO_PDF_CONFIG.margins.left, y);
    
    y += 5;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.text(`${restricao.descricao}`, LAUDO_PDF_CONFIG.margins.left + 5, y);
    
    y += 5;
    pdf.setFontSize(LAUDO_PDF_CONFIG.fontSize.small);
    pdf.text(`Incluída em: ${new Date(restricao.dataInclusao).toLocaleDateString('pt-BR')}`, LAUDO_PDF_CONFIG.margins.left + 5, y);
    
    y += 8;
    pdf.setFontSize(LAUDO_PDF_CONFIG.fontSize.body);
  });
  
  return y + 5;
}

/** Adicionar recalls */
function addRecalls(pdf: jsPDF, y: number, laudo: LaudoVeicular): number {
  const { recalls } = laudo.consulta;
  
  y = addSectionTitle(pdf, y, 'RECALLS');
  
  pdf.setFontSize(LAUDO_PDF_CONFIG.fontSize.body);
  
  if (recalls.length === 0) {
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(5, 150, 105);
    pdf.text('✓ SEM RECALLS PENDENTES', LAUDO_PDF_CONFIG.margins.left, y);
    return y + 10;
  }
  
  const recallsPendentes = recalls.filter(r => r.status === 'pendente');
  
  if (recallsPendentes.length === 0) {
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(5, 150, 105);
    pdf.text('✓ RECALLS EM DIA', LAUDO_PDF_CONFIG.margins.left, y);
    return y + 10;
  }
  
  pdf.setTextColor(0, 0, 0);
  recallsPendentes.forEach((recall) => {
    const riskColor = recall.risco === 'alto' ? [220, 38, 38] : [217, 119, 6];
    
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(riskColor[0], riskColor[1], riskColor[2]);
    pdf.text(`⚠ ${recall.campanha} - RISCO ${recall.risco.toUpperCase()}`, LAUDO_PDF_CONFIG.margins.left, y);
    
    y += 5;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.text(`${recall.descricao}`, LAUDO_PDF_CONFIG.margins.left + 5, y);
    
    y += 8;
  });
  
  return y + 5;
}

/** Adicionar sugestão de preço */
function addSugestaoPreco(pdf: jsPDF, y: number, laudo: LaudoVeicular): number {
  const { sugestaoPreco } = laudo;
  const { dadosFipe } = laudo.consulta;
  
  y = addSectionTitle(pdf, y, 'AVALIAÇÃO DE PREÇO');
  
  pdf.setFontSize(LAUDO_PDF_CONFIG.fontSize.body);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  
  if (dadosFipe) {
    pdf.text(`Tabela FIPE (${dadosFipe.mesReferencia}): R$ ${dadosFipe.valor.toLocaleString('pt-BR')}`, LAUDO_PDF_CONFIG.margins.left, y);
    y += 6;
  }
  
  pdf.text(`Ajuste recomendado: ${sugestaoPreco.ajusteRecomendado > 0 ? '+' : ''}${(sugestaoPreco.ajusteRecomendado * 100).toFixed(1)}%`, LAUDO_PDF_CONFIG.margins.left, y);
  y += 6;
  
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(13, 148, 136);
  pdf.text(`PREÇO SUGERIDO: R$ ${sugestaoPreco.precoSugerido.toLocaleString('pt-BR')}`, LAUDO_PDF_CONFIG.margins.left, y);
  
  y += 8;
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(LAUDO_PDF_CONFIG.fontSize.small);
  
  const justificativaLines = pdf.splitTextToSize(
    sugestaoPreco.justificativa,
    170
  );
  
  justificativaLines.forEach((line: string) => {
    pdf.text(line, LAUDO_PDF_CONFIG.margins.left, y);
    y += 4;
  });
  
  return y + 5;
}

/** Adicionar conclusão */
function addConclusao(pdf: jsPDF, y: number, laudo: LaudoVeicular): number {
  const { analiseRisco } = laudo;
  
  y = addSectionTitle(pdf, y, 'CONCLUSÃO E RECOMENDAÇÃO');
  
  pdf.setFontSize(LAUDO_PDF_CONFIG.fontSize.body);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  
  const recomendacaoLines = pdf.splitTextToSize(
    analiseRisco.recomendacao,
    170
  );
  
  recomendacaoLines.forEach((line: string) => {
    pdf.text(line, LAUDO_PDF_CONFIG.margins.left, y);
    y += 5;
  });
  
  return y + 10;
}

/** Adicionar título de seção */
function addSectionTitle(pdf: jsPDF, y: number, title: string): number {
  pdf.setFontSize(LAUDO_PDF_CONFIG.fontSize.subtitle);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(13, 148, 136);
  pdf.text(title, LAUDO_PDF_CONFIG.margins.left, y);
  
  // Linha sob o título
  pdf.setDrawColor(13, 148, 136);
  pdf.line(LAUDO_PDF_CONFIG.margins.left, y + 2, LAUDO_PDF_CONFIG.margins.left + 50, y + 2);
  
  return y + 10;
}

/** Adicionar rodapé do laudo */
function addLaudoFooter(pdf: jsPDF): void {
  const pageCount = pdf.getNumberOfPages();
  
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Linha separadora
    pdf.setDrawColor(200, 200, 200);
    pdf.line(LAUDO_PDF_CONFIG.margins.left, pageHeight - 25, pageWidth - LAUDO_PDF_CONFIG.margins.right, pageHeight - 25);
    
    pdf.setFontSize(LAUDO_PDF_CONFIG.fontSize.caption);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(107, 114, 128);
    
    // Disclaimer
    const disclaimer = 'Este laudo é informativo e não substitui vistoria presencial. Consulta Car - Laudo gerado automaticamente.';
    pdf.text(disclaimer, LAUDO_PDF_CONFIG.margins.left, pageHeight - 15);
    
    // Número da página
    const pageText = `Página ${i} de ${pageCount}`;
    const pageTextWidth = pdf.getTextWidth(pageText);
    pdf.text(pageText, pageWidth - LAUDO_PDF_CONFIG.margins.right - pageTextWidth, pageHeight - 15);
    
    // Data/hora de geração
    const timestamp = new Date().toLocaleString('pt-BR');
    pdf.text(`Gerado em: ${timestamp}`, LAUDO_PDF_CONFIG.margins.left, pageHeight - 8);
  }
}