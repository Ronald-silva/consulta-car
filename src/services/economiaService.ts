/**
 * Serviço para cálculos de economia em multas de trânsito
 */

import type { MultaCalculadora, CenarioEconomia, RelatorioEconomia } from '../stores/calculadoraStore';

export interface FatoresRecurso {
  tipoInfracao: string;
  valorMulta: number;
  pontos: number;
  orgaoAutuador: string;
  tempoDecorrido: number; // dias desde a infração
  equipamento?: string;
  local?: string;
}

export interface AnaliseRecurso {
  chanceSuccesso: number;
  fatoresPositivos: string[];
  fatoresNegativos: string[];
  recomendacao: string;
  argumentosPrincipais: string[];
}

/**
 * Calcular desconto SNE (40%)
 */
export function calcularDescontoSNE(valorOriginal: number): number {
  return valorOriginal * 0.6; // 40% de desconto
}

/**
 * Calcular juros e correção após vencimento
 */
export function calcularValorComJuros(
  valorOriginal: number, 
  diasAtraso: number = 30
): number {
  // Juros de 0.33% ao dia + correção monetária
  const jurosDiarios = 0.0033;
  const correcaoMonetaria = 0.05; // 5% de correção
  
  const juros = valorOriginal * jurosDiarios * diasAtraso;
  const correcao = valorOriginal * correcaoMonetaria;
  
  return valorOriginal + juros + correcao;
}

/**
 * Analisar chances de sucesso no recurso usando IA
 */
export async function analisarChancesRecurso(fatores: FatoresRecurso): Promise<AnaliseRecurso> {
  // Simular processamento de IA
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  let chanceBase = 25; // Chance base de sucesso
  const fatoresPositivos: string[] = [];
  const fatoresNegativos: string[] = [];
  const argumentosPrincipais: string[] = [];
  
  // Análise por tipo de infração
  if (fatores.tipoInfracao.toLowerCase().includes('velocidade')) {
    chanceBase += 20;
    fatoresPositivos.push('Multas de velocidade têm alta contestabilidade');
    argumentosPrincipais.push('Questionamento da calibração do equipamento');
    
    if (fatores.tipoInfracao.includes('até 20%')) {
      chanceBase += 10;
      fatoresPositivos.push('Excesso até 20% tem margem de erro considerável');
    }
  }
  
  if (fatores.tipoInfracao.toLowerCase().includes('radar')) {
    chanceBase += 25;
    fatoresPositivos.push('Equipamentos de radar requerem certificação INMETRO');
    argumentosPrincipais.push('Verificação da aferição do radar');
    argumentosPrincipais.push('Análise da sinalização adequada');
  }
  
  if (fatores.tipoInfracao.toLowerCase().includes('sinal') || 
      fatores.tipoInfracao.toLowerCase().includes('semáforo')) {
    chanceBase += 15;
    fatoresPositivos.push('Infrações de semáforo dependem de visibilidade da sinalização');
    argumentosPrincipais.push('Verificação do tempo de amarelo');
  }
  
  if (fatores.tipoInfracao.toLowerCase().includes('estacion')) {
    chanceBase += 10;
    fatoresPositivos.push('Multas de estacionamento dependem de sinalização clara');
    argumentosPrincipais.push('Análise da sinalização local');
  }
  
  // Análise por valor da multa
  if (fatores.valorMulta > 500) {
    chanceBase += 15;
    fatoresPositivos.push('Multas de alto valor justificam contestação detalhada');
  } else if (fatores.valorMulta < 100) {
    chanceBase -= 5;
    fatoresNegativos.push('Valor baixo pode não justificar o processo');
  }
  
  // Análise por pontos na CNH
  if (fatores.pontos >= 7) {
    chanceBase += 20;
    fatoresPositivos.push('Multas gravíssimas (7 pontos) merecem contestação');
    argumentosPrincipais.push('Evitar suspensão da CNH');
  } else if (fatores.pontos >= 5) {
    chanceBase += 10;
    fatoresPositivos.push('Multas graves justificam recurso pelos pontos');
  }
  
  // Análise por órgão autuador
  if (fatores.orgaoAutuador.includes('CET')) {
    chanceBase += 15;
    fatoresPositivos.push('CET-SP tem histórico de irregularidades em equipamentos');
  }
  
  if (fatores.orgaoAutuador.includes('PRF')) {
    chanceBase -= 10;
    fatoresNegativos.push('PRF tem procedimentos mais rigorosos');
  }
  
  // Análise por tempo decorrido
  if (fatores.tempoDecorrido > 90) {
    chanceBase += 10;
    fatoresPositivos.push('Notificação tardia pode indicar irregularidades');
    argumentosPrincipais.push('Questionamento do prazo de notificação');
  }
  
  if (fatores.tempoDecorrido < 15) {
    chanceBase += 5;
    fatoresPositivos.push('Notificação rápida permite contestação no prazo');
  }
  
  // Fatores negativos gerais
  if (fatores.tipoInfracao.toLowerCase().includes('documento')) {
    chanceBase -= 15;
    fatoresNegativos.push('Infrações documentais são mais difíceis de contestar');
  }
  
  if (fatores.tipoInfracao.toLowerCase().includes('cinto')) {
    chanceBase -= 10;
    fatoresNegativos.push('Uso de cinto é facilmente verificável');
  }
  
  // Garantir que a chance fique entre 10% e 90%
  const chanceSuccesso = Math.max(10, Math.min(90, chanceBase));
  
  // Gerar recomendação
  let recomendacao = '';
  if (chanceSuccesso >= 70) {
    recomendacao = 'ALTAMENTE RECOMENDADO - Excelentes chances de sucesso';
  } else if (chanceSuccesso >= 50) {
    recomendacao = 'RECOMENDADO - Boas chances de cancelamento';
  } else if (chanceSuccesso >= 30) {
    recomendacao = 'AVALIAR - Chances moderadas, considere o valor vs. risco';
  } else {
    recomendacao = 'NÃO RECOMENDADO - Baixas chances, melhor pagar com desconto';
  }
  
  // Adicionar argumentos padrão se não houver específicos
  if (argumentosPrincipais.length === 0) {
    argumentosPrincipais.push('Análise da legalidade do procedimento');
    argumentosPrincipais.push('Verificação da notificação');
  }
  
  return {
    chanceSuccesso,
    fatoresPositivos,
    fatoresNegativos,
    recomendacao,
    argumentosPrincipais
  };
}

/**
 * Comparar cenários de economia
 */
export function compararCenarios(multa: MultaCalculadora): CenarioEconomia[] {
  const valorOriginal = multa.valorOriginal;
  const valorSNE = multa.valorComDescontoSNE;
  const valorComJuros = calcularValorComJuros(valorOriginal);
  const chanceRecurso = multa.chanceSuccessoRecurso;
  
  const cenarios: CenarioEconomia[] = [
    {
      id: 'sne',
      nome: 'Pagar com SNE',
      descricao: '40% de desconto imediato',
      valor: valorSNE,
      economia: valorOriginal - valorSNE,
      pontos: multa.pontos,
      prazo: 'Até o vencimento',
      vantagens: [
        '40% de desconto garantido',
        'Pagamento imediato resolve',
        'Sem risco de complicações',
        'Processo mais simples'
      ],
      desvantagens: [
        'Pontos aplicados na CNH',
        'Admite culpa pela infração'
      ],
      recomendado: chanceRecurso < 60,
      cor: 'green'
    },
    {
      id: 'recurso',
      nome: 'Recorrer com IA',
      descricao: `${chanceRecurso}% de chance de sucesso`,
      valor: chanceRecurso > 50 ? 0 : valorOriginal,
      economia: chanceRecurso > 50 ? valorOriginal : 0,
      pontos: chanceRecurso > 50 ? 0 : multa.pontos,
      prazo: '15-30 dias para análise',
      vantagens: [
        `${chanceRecurso}% de chance de cancelamento total`,
        'Evita pontos na CNH se ganhar',
        'Recurso gerado automaticamente pela IA',
        'Sem custo adicional para tentar'
      ],
      desvantagens: [
        'Processo pode demorar até 30 dias',
        'Se perder, paga valor integral',
        'Requer acompanhamento do processo'
      ],
      recomendado: chanceRecurso >= 60,
      cor: 'blue'
    },
    {
      id: 'integral',
      nome: 'Não Fazer Nada',
      descricao: 'Pagar após vencimento',
      valor: valorComJuros,
      economia: 0,
      pontos: multa.pontos,
      prazo: 'Após vencimento (com juros)',
      vantagens: [
        'Não precisa tomar ação imediata'
      ],
      desvantagens: [
        `Valor aumenta para R$ ${valorComJuros.toFixed(2)}`,
        'Pontos aplicados na CNH',
        'Risco de suspensão da habilitação',
        'Pode gerar mais complicações futuras'
      ],
      recomendado: false,
      cor: 'red'
    }
  ];
  
  return cenarios;
}

/**
 * Calcular economia total de múltiplas multas
 */
export function calcularEconomiaTotal(multas: MultaCalculadora[]): {
  valorTotal: number;
  economiaSNE: number;
  economiaRecursos: number;
  economiaMaxima: number;
  pontosEvitados: number;
  estrategiaRecomendada: string;
} {
  const valorTotal = multas.reduce((sum, m) => sum + m.valorOriginal, 0);
  
  const economiaSNE = multas.reduce((sum, m) => {
    return sum + (m.valorOriginal - m.valorComDescontoSNE);
  }, 0);
  
  const economiaRecursos = multas.reduce((sum, m) => {
    return sum + (m.chanceSuccessoRecurso > 60 ? m.valorOriginal : 0);
  }, 0);
  
  const economiaMaxima = multas.reduce((sum, m) => {
    const economiaSNEMulta = m.valorOriginal - m.valorComDescontoSNE;
    const economiaRecursoMulta = m.chanceSuccessoRecurso > 60 ? m.valorOriginal : 0;
    return sum + Math.max(economiaSNEMulta, economiaRecursoMulta);
  }, 0);
  
  const pontosEvitados = multas.reduce((sum, m) => {
    return sum + (m.chanceSuccessoRecurso > 60 ? m.pontos : 0);
  }, 0);
  
  let estrategiaRecomendada = 'Estratégia Mista';
  if (economiaSNE > economiaRecursos * 1.2) {
    estrategiaRecomendada = 'Pagar todas com desconto SNE';
  } else if (economiaRecursos > economiaSNE * 1.2) {
    estrategiaRecomendada = 'Recorrer todas com IA';
  }
  
  return {
    valorTotal,
    economiaSNE,
    economiaRecursos,
    economiaMaxima,
    pontosEvitados,
    estrategiaRecomendada
  };
}

/**
 * Gerar dados para gráficos de economia
 */
export function gerarDadosGraficos(cenarios: CenarioEconomia[]): {
  labels: string[];
  valores: number[];
  cores: string[];
  economias: number[];
} {
  const labels = cenarios.map(c => c.nome);
  const valores = cenarios.map(c => c.valor);
  const cores = cenarios.map(c => {
    switch (c.cor) {
      case 'green': return '#10b981';
      case 'blue': return '#3b82f6';
      case 'red': return '#ef4444';
      default: return '#6b7280';
    }
  });
  const economias = cenarios.map(c => c.economia);
  
  return { labels, valores, cores, economias };
}

/**
 * Calcular ROI (Return on Investment) do recurso
 */
export function calcularROIRecurso(multa: MultaCalculadora): {
  investimento: number;
  retornoPotencial: number;
  roi: number;
  tempoRetorno: string;
} {
  const investimento = 0; // Recurso é gratuito com IA
  const retornoPotencial = multa.chanceSuccessoRecurso > 50 ? multa.valorOriginal : 0;
  const roi = investimento === 0 ? Infinity : (retornoPotencial / investimento) * 100;
  const tempoRetorno = '15-30 dias';
  
  return {
    investimento,
    retornoPotencial,
    roi,
    tempoRetorno
  };
}

/**
 * Simular diferentes estratégias para múltiplas multas
 */
export function simularEstrategias(multas: MultaCalculadora[]): {
  estrategiaSNE: { custo: number; pontos: number; economia: number };
  estrategiaRecurso: { custo: number; pontos: number; economia: number };
  estrategiaMista: { custo: number; pontos: number; economia: number };
} {
  const valorTotal = multas.reduce((sum, m) => sum + m.valorOriginal, 0);
  
  // Estratégia 1: Pagar todas com SNE
  const custoSNE = multas.reduce((sum, m) => sum + m.valorComDescontoSNE, 0);
  const pontosSNE = multas.reduce((sum, m) => sum + m.pontos, 0);
  const economiaSNE = valorTotal - custoSNE;
  
  // Estratégia 2: Recorrer todas
  const custoRecurso = multas.reduce((sum, m) => {
    return sum + (m.chanceSuccessoRecurso > 50 ? 0 : m.valorOriginal);
  }, 0);
  const pontosRecurso = multas.reduce((sum, m) => {
    return sum + (m.chanceSuccessoRecurso > 50 ? 0 : m.pontos);
  }, 0);
  const economiaRecurso = valorTotal - custoRecurso;
  
  // Estratégia 3: Mista (melhor opção para cada multa)
  const custoMista = multas.reduce((sum, m) => {
    const economiaSNEMulta = m.valorOriginal - m.valorComDescontoSNE;
    const economiaRecursoMulta = m.chanceSuccessoRecurso > 60 ? m.valorOriginal : 0;
    
    if (economiaRecursoMulta > economiaSNEMulta) {
      return sum + (m.chanceSuccessoRecurso > 60 ? 0 : m.valorOriginal);
    } else {
      return sum + m.valorComDescontoSNE;
    }
  }, 0);
  
  const pontosMista = multas.reduce((sum, m) => {
    const economiaSNEMulta = m.valorOriginal - m.valorComDescontoSNE;
    const economiaRecursoMulta = m.chanceSuccessoRecurso > 60 ? m.valorOriginal : 0;
    
    if (economiaRecursoMulta > economiaSNEMulta && m.chanceSuccessoRecurso > 60) {
      return sum + 0; // Recurso bem-sucedido
    } else {
      return sum + m.pontos; // Pagar com SNE
    }
  }, 0);
  
  const economiaMista = valorTotal - custoMista;
  
  return {
    estrategiaSNE: { custo: custoSNE, pontos: pontosSNE, economia: economiaSNE },
    estrategiaRecurso: { custo: custoRecurso, pontos: pontosRecurso, economia: economiaRecurso },
    estrategiaMista: { custo: custoMista, pontos: pontosMista, economia: economiaMista }
  };
}