import jsPDF from 'jspdf';
import type { Recurso, RecorrenteData } from '../types';

/** Configurações do PDF */
const PDF_CONFIG = {
  format: 'a4',
  margins: {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20,
  },
  fontSize: {
    title: 16,
    subtitle: 14,
    body: 12,
    small: 10,
  },
  lineHeight: 1.5,
};

/** Gerar PDF do recurso */
export async function generateRecursoPDF(recurso: Recurso): Promise<Blob> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  let currentY = PDF_CONFIG.margins.top;

  // Cabeçalho
  currentY = addHeader(pdf, currentY);
  
  // Título
  currentY = addTitle(pdf, currentY, recurso.tipoRecurso);
  
  // Dados do recorrente
  currentY = addRecorrenteData(pdf, currentY, recurso.recorrente);
  
  // Dados da multa
  currentY = addMultaData(pdf, currentY, recurso);
  
  // Argumentos selecionados
  currentY = addArgumentos(pdf, currentY, recurso);
  
  // Texto personalizado
  if (recurso.textoPersonalizado) {
    currentY = addTextoPersonalizado(pdf, currentY, recurso.textoPersonalizado);
  }
  
  // Pedidos
  currentY = addPedidos(pdf, currentY);
  
  // Assinatura
  currentY = addAssinatura(pdf, currentY, recurso.recorrente.nome);
  
  // Rodapé
  addFooter(pdf);

  return pdf.output('blob');
}

/** Adicionar cabeçalho */
function addHeader(pdf: jsPDF, y: number): number {
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // Logo/Título do app
  pdf.setFontSize(PDF_CONFIG.fontSize.subtitle);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Consulta Car - Assistente Jurídico', PDF_CONFIG.margins.left, y);
  
  // Data
  pdf.setFontSize(PDF_CONFIG.fontSize.small);
  pdf.setFont('helvetica', 'normal');
  const dataAtual = new Date().toLocaleDateString('pt-BR');
  pdf.text(`Gerado em: ${dataAtual}`, pageWidth - PDF_CONFIG.margins.right - 40, y);
  
  // Linha separadora
  y += 10;
  pdf.line(PDF_CONFIG.margins.left, y, pageWidth - PDF_CONFIG.margins.right, y);
  
  return y + 10;
}

/** Adicionar título */
function addTitle(pdf: jsPDF, y: number, tipoRecurso: string): number {
  const titulo = tipoRecurso === 'defesa_previa' 
    ? 'DEFESA PRÉVIA' 
    : 'RECURSO EM 1ª INSTÂNCIA - JARI';
  
  pdf.setFontSize(PDF_CONFIG.fontSize.title);
  pdf.setFont('helvetica', 'bold');
  
  const pageWidth = pdf.internal.pageSize.getWidth();
  const textWidth = pdf.getTextWidth(titulo);
  const x = (pageWidth - textWidth) / 2;
  
  pdf.text(titulo, x, y);
  
  return y + 15;
}

/** Adicionar dados do recorrente */
function addRecorrenteData(pdf: jsPDF, y: number, recorrente: RecorrenteData): number {
  pdf.setFontSize(PDF_CONFIG.fontSize.subtitle);
  pdf.setFont('helvetica', 'bold');
  pdf.text('DADOS DO RECORRENTE', PDF_CONFIG.margins.left, y);
  
  y += 8;
  pdf.setFontSize(PDF_CONFIG.fontSize.body);
  pdf.setFont('helvetica', 'normal');
  
  const dados = [
    `Nome: ${recorrente.nome}`,
    `CPF: ${recorrente.cpf}`,
    `CNH: ${recorrente.cnh}`,
    `Endereço: ${recorrente.endereco.logradouro}, ${recorrente.endereco.numero}`,
    `${recorrente.endereco.bairro} - ${recorrente.endereco.cidade}/${recorrente.endereco.uf}`,
    `CEP: ${recorrente.endereco.cep}`,
  ];

  if (recorrente.telefone) {
    dados.push(`Telefone: ${recorrente.telefone}`);
  }

  if (recorrente.email) {
    dados.push(`E-mail: ${recorrente.email}`);
  }

  dados.forEach(linha => {
    pdf.text(linha, PDF_CONFIG.margins.left, y);
    y += 6;
  });

  return y + 5;
}

/** Adicionar dados da multa */
function addMultaData(pdf: jsPDF, y: number, recurso: Recurso): number {
  pdf.setFontSize(PDF_CONFIG.fontSize.subtitle);
  pdf.setFont('helvetica', 'bold');
  pdf.text('DADOS DA INFRAÇÃO', PDF_CONFIG.margins.left, y);
  
  y += 8;
  pdf.setFontSize(PDF_CONFIG.fontSize.body);
  pdf.setFont('helvetica', 'normal');
  
  const ocrData = recurso.ocrData;
  if (!ocrData) return y;

  const dados = [
    `Auto de Infração: ${ocrData.numeroAuto}`,
    `Placa: ${ocrData.placa}`,
    `Data da Infração: ${ocrData.dataInfracao}`,
    `Local: ${ocrData.local}`,
    `Órgão Autuador: ${ocrData.orgaoAutuador}`,
    `Código da Infração: ${ocrData.codigoInfracao}`,
    `Descrição: ${ocrData.descricaoInfracao}`,
    `Valor: R$ ${ocrData.valor?.toFixed(2)}`,
  ];

  if (ocrData.equipamento) {
    dados.push(`Equipamento: ${ocrData.equipamento}`);
  }

  dados.forEach(linha => {
    pdf.text(linha, PDF_CONFIG.margins.left, y);
    y += 6;
  });

  return y + 5;
}

/** Adicionar argumentos */
function addArgumentos(pdf: jsPDF, y: number, recurso: Recurso): number {
  if (!recurso.iaAnalysis || !recurso.argumentosSelecionados?.length) {
    return y;
  }

  pdf.setFontSize(PDF_CONFIG.fontSize.subtitle);
  pdf.setFont('helvetica', 'bold');
  pdf.text('FUNDAMENTOS JURÍDICOS', PDF_CONFIG.margins.left, y);
  
  y += 8;
  pdf.setFontSize(PDF_CONFIG.fontSize.body);
  pdf.setFont('helvetica', 'normal');

  const argumentosSelecionados = recurso.iaAnalysis.argumentos.filter(
    arg => recurso.argumentosSelecionados.includes(arg.tipo)
  );

  argumentosSelecionados.forEach((argumento, index) => {
    // Verificar se precisa de nova página
    if (y > 250) {
      pdf.addPage();
      y = PDF_CONFIG.margins.top;
    }

    pdf.setFont('helvetica', 'bold');
    pdf.text(`${index + 1}. ${argumento.tipo}`, PDF_CONFIG.margins.left, y);
    y += 6;

    pdf.setFont('helvetica', 'normal');
    
    // Quebrar texto longo
    const descricaoLines = pdf.splitTextToSize(
      argumento.descricao, 
      pdf.internal.pageSize.getWidth() - PDF_CONFIG.margins.left - PDF_CONFIG.margins.right
    );
    
    descricaoLines.forEach((line: string) => {
      pdf.text(line, PDF_CONFIG.margins.left + 5, y);
      y += 5;
    });

    y += 3;

    pdf.setFont('helvetica', 'italic');
    const fundamentacaoLines = pdf.splitTextToSize(
      `Fundamentação: ${argumento.fundamentacao}`,
      pdf.internal.pageSize.getWidth() - PDF_CONFIG.margins.left - PDF_CONFIG.margins.right
    );

    fundamentacaoLines.forEach((line: string) => {
      pdf.text(line, PDF_CONFIG.margins.left + 5, y);
      y += 5;
    });

    y += 5;
  });

  return y;
}

/** Adicionar texto personalizado */
function addTextoPersonalizado(pdf: jsPDF, y: number, texto: string): number {
  if (!texto.trim()) return y;

  pdf.setFontSize(PDF_CONFIG.fontSize.subtitle);
  pdf.setFont('helvetica', 'bold');
  pdf.text('CONSIDERAÇÕES ADICIONAIS', PDF_CONFIG.margins.left, y);
  
  y += 8;
  pdf.setFontSize(PDF_CONFIG.fontSize.body);
  pdf.setFont('helvetica', 'normal');

  const linhas = pdf.splitTextToSize(
    texto,
    pdf.internal.pageSize.getWidth() - PDF_CONFIG.margins.left - PDF_CONFIG.margins.right
  );

  linhas.forEach((linha: string) => {
    if (y > 250) {
      pdf.addPage();
      y = PDF_CONFIG.margins.top;
    }
    pdf.text(linha, PDF_CONFIG.margins.left, y);
    y += 6;
  });

  return y + 5;
}

/** Adicionar pedidos */
function addPedidos(pdf: jsPDF, y: number): number {
  pdf.setFontSize(PDF_CONFIG.fontSize.subtitle);
  pdf.setFont('helvetica', 'bold');
  pdf.text('DOS PEDIDOS', PDF_CONFIG.margins.left, y);
  
  y += 8;
  pdf.setFontSize(PDF_CONFIG.fontSize.body);
  pdf.setFont('helvetica', 'normal');

  const pedidos = [
    'Diante do exposto, requer-se:',
    '',
    'a) O conhecimento e provimento do presente recurso;',
    'b) A anulação do auto de infração em questão;',
    'c) O cancelamento da pontuação na CNH;',
    'd) A não cobrança do valor da multa.',
    '',
    'Termos em que pede deferimento.',
  ];

  pedidos.forEach(pedido => {
    pdf.text(pedido, PDF_CONFIG.margins.left, y);
    y += 6;
  });

  return y + 10;
}

/** Adicionar assinatura */
function addAssinatura(pdf: jsPDF, y: number, nome: string): number {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const dataAtual = new Date().toLocaleDateString('pt-BR');
  
  pdf.setFontSize(PDF_CONFIG.fontSize.body);
  pdf.setFont('helvetica', 'normal');
  
  // Data e local
  pdf.text(`Fortaleza, ${dataAtual}`, PDF_CONFIG.margins.left, y);
  
  y += 20;
  
  // Linha para assinatura
  const linhaX = pageWidth / 2 - 40;
  pdf.line(linhaX, y, linhaX + 80, y);
  
  y += 5;
  
  // Nome
  const nomeX = pageWidth / 2 - (pdf.getTextWidth(nome) / 2);
  pdf.text(nome, nomeX, y);
  
  return y + 5;
}

/** Adicionar rodapé */
function addFooter(pdf: jsPDF): void {
  const pageCount = pdf.getNumberOfPages();
  
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    pdf.setFontSize(PDF_CONFIG.fontSize.small);
    pdf.setFont('helvetica', 'normal');
    
    // Número da página
    const pageText = `Página ${i} de ${pageCount}`;
    const pageTextWidth = pdf.getTextWidth(pageText);
    pdf.text(pageText, pageWidth - PDF_CONFIG.margins.right - pageTextWidth, pageHeight - 10);
    
    // Disclaimer
    const disclaimer = 'Documento gerado pelo Consulta Car - Não substitui orientação jurídica profissional';
    pdf.text(disclaimer, PDF_CONFIG.margins.left, pageHeight - 10);
  }
}

/** Gerar checklist de documentos em PDF */
export async function generateChecklistPDF(
  documentos: string[],
  recorrenteNome: string
): Promise<Blob> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  let y = PDF_CONFIG.margins.top;

  // Cabeçalho
  y = addHeader(pdf, y);
  
  // Título
  pdf.setFontSize(PDF_CONFIG.fontSize.title);
  pdf.setFont('helvetica', 'bold');
  pdf.text('CHECKLIST DE DOCUMENTOS', PDF_CONFIG.margins.left, y);
  
  y += 15;
  
  pdf.setFontSize(PDF_CONFIG.fontSize.body);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Recorrente: ${recorrenteNome}`, PDF_CONFIG.margins.left, y);
  
  y += 10;
  
  pdf.text('Documentos necessários para o recurso:', PDF_CONFIG.margins.left, y);
  y += 10;

  // Lista de documentos
  documentos.forEach(doc => {
    pdf.text('☐', PDF_CONFIG.margins.left, y);
    pdf.text(doc, PDF_CONFIG.margins.left + 10, y);
    y += 8;
  });

  addFooter(pdf);

  return pdf.output('blob');
}