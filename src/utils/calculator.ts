import type { Multa, CalculationResult } from '../types';

/** Calcula todos os resultados da multa */
export function calculateMultaResults(multa: Partial<Multa>): CalculationResult | null {
  if (!multa.valor || multa.valor <= 0) return null;

  const valor = multa.valor;
  const pontos = multa.pontos || 0;
  const dataVencimento = multa.dataVencimento ? new Date(multa.dataVencimento) : null;
  const now = new Date();

  // Cálculos principais
  const descontoSNE = valor * 0.4; // 40% de desconto
  const valorComDescontoSNE = valor - descontoSNE;
  const economiaSeGanhar = valor;

  // Calcular juros se atrasar
  let valorComJuros = valor;
  let diasAtraso = 0;
  if (dataVencimento && now > dataVencimento) {
    diasAtraso = Math.ceil((now.getTime() - dataVencimento.getTime()) / (1000 * 60 * 60 * 24));
    const mesesAtraso = Math.ceil(diasAtraso / 30);
    const juros = valor * 0.02 * mesesAtraso; // 2% ao mês
    valorComJuros = valor + juros;
  }

  // Verificar elegibilidade SNE
  const isElegivelSNE = checkSNEEligibility(pontos, multa.codigoInfracao);

  // Calcular probabilidade de sucesso no recurso
  const probabilidadeRecurso = calculateRecursoProbability(multa);

  // Gerar recomendação
  const recomendacao = generateRecomendacao(
    valor,
    isElegivelSNE,
    probabilidadeRecurso,
    diasAtraso,
  );

  return {
    valorOriginal: valor,
    descontoSNE,
    valorComDescontoSNE,
    economiaSeGanhar,
    valorComJuros,
    diasAtraso,
    pontosEvitados: pontos,
    isElegivelSNE,
    probabilidadeRecurso,
    recomendacao,
  };
}

/** Verifica elegibilidade para SNE */
function checkSNEEligibility(pontos: number, codigoInfracao?: string): boolean {
  // Regras básicas do SNE
  if (pontos > 7) return false;

  // Infrações que não são elegíveis (exemplos comuns)
  const infracaoesNaoElegiveis = [
    '74550', // Dirigir sob efeito de álcool
    '73900', // Recusar teste do bafômetro
    '70440', // Ultrapassagem em local proibido
    '70710', // Avançar sinal vermelho
    '73800', // Dirigir sem CNH
  ];

  if (codigoInfracao && infracaoesNaoElegiveis.includes(codigoInfracao)) {
    return false;
  }

  return true;
}

/** Calcula probabilidade de sucesso no recurso (0-1) */
function calculateRecursoProbability(multa: Partial<Multa>): number {
  let probability = 0.3; // Base: 30%

  // Aumentar probabilidade baseado em fatores
  if (multa.equipamento?.toLowerCase().includes('radar')) {
    probability += 0.2; // +20% para radares (calibração, sinalização)
  }

  if (multa.velocidadePermitida && multa.velocidadeAferida) {
    const permitida = parseFloat(multa.velocidadePermitida) || 0;
    const aferida = parseFloat(multa.velocidadeAferida) || 0;
    const excesso = ((aferida - permitida) / permitida) * 100;

    if (excesso < 20) {
      probability += 0.15; // +15% para excesso menor
    }
  }

  if (multa.local?.toLowerCase().includes('escola') ||
      multa.local?.toLowerCase().includes('hospital')) {
    probability -= 0.1; // -10% em locais sensíveis
  }

  // Verificar se é infração de trânsito comum com alta contestação
  const infracoesContestáveis = ['74630', '74640', '74550']; // Radares comuns
  if (multa.codigoInfracao && infracoesContestáveis.includes(multa.codigoInfracao)) {
    probability += 0.1;
  }

  return Math.max(0.1, Math.min(0.8, probability)); // Entre 10% e 80%
}

/** Gera recomendação personalizada */
function generateRecomendacao(
  valor: number,
  isElegivelSNE: boolean,
  probabilidadeRecurso: number,
  diasAtraso: number,
): string {
  if (diasAtraso > 30) {
    return 'Multa em atraso! Pague com desconto SNE se elegível ou quite imediatamente para evitar mais juros.';
  }

  if (isElegivelSNE && probabilidadeRecurso < 0.4) {
    return 'Recomendamos pagar com desconto SNE (40% off). Baixa chance de sucesso no recurso.';
  }

  if (probabilidadeRecurso > 0.6) {
    return 'Alta chance de sucesso no recurso! Recomendamos contestar a multa.';
  }

  if (valor > 500 && probabilidadeRecurso > 0.4) {
    return 'Valor alto - vale a pena tentar o recurso. Use nossa análise com IA para fundamentar.';
  }

  if (isElegivelSNE) {
    return 'Você pode pagar com 40% de desconto no SNE ou tentar recurso. Analise as opções abaixo.';
  }

  return 'Avalie as opções disponíveis. Nossa IA pode ajudar a analisar a multa para recurso.';
}

/** Formatar valor monetário */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/** Formatar porcentagem */
export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value);
}

/** Obter cor do risco baseado no atraso */
export function getRiskColor(diasAtraso: number): string {
  if (diasAtraso > 60) return 'text-red-600 bg-red-50 border-red-200';
  if (diasAtraso > 30) return 'text-orange-600 bg-orange-50 border-orange-200';
  if (diasAtraso > 0) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  return 'text-green-600 bg-green-50 border-green-200';
}

/** Obter texto do status de risco */
export function getRiskText(diasAtraso: number): string {
  if (diasAtraso > 60) return 'Risco Alto';
  if (diasAtraso > 30) return 'Risco Médio';
  if (diasAtraso > 0) return 'Atenção';
  return 'Em Dia';
}