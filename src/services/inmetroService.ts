import type { InmetroResult } from '../types';

/** Simular consulta ao Inmetro (implementação futura com API real) */
export async function consultarInmetro(
  equipamento: string,
  local?: string
): Promise<InmetroResult> {
  // Simular delay da API
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Simulação baseada em padrões conhecidos
  const equipamentoLower = equipamento.toLowerCase();
  
  // Equipamentos comumente irregulares (simulação)
  const equipamentosIrregulares = [
    'radar antigo',
    'lombada sem certificado',
    'equipamento vencido',
  ];

  // Equipamentos válidos conhecidos
  const equipamentosValidos = [
    'radar fixo',
    'radar móvel',
    'lombada eletrônica',
    'pardal',
  ];

  let status: InmetroResult['status'] = 'nao_encontrado';
  let observacoes = '';

  if (equipamentosIrregulares.some(eq => equipamentoLower.includes(eq))) {
    status = 'irregular';
    observacoes = 'Equipamento com certificação vencida ou irregular';
  } else if (equipamentosValidos.some(eq => equipamentoLower.includes(eq))) {
    status = 'valido';
    observacoes = 'Equipamento com certificação válida';
  } else {
    status = 'nao_encontrado';
    observacoes = 'Equipamento não encontrado na base do Inmetro';
  }

  return {
    status,
    equipamento,
    certificado: status === 'valido' ? `CERT-${Math.random().toString(36).substr(2, 9).toUpperCase()}` : undefined,
    dataVencimento: status === 'valido' ? '2025-12-31' : undefined,
    observacoes,
  };
}

/** Verificar se é multa de radar */
export function isRadarMulta(
  codigoInfracao?: string,
  descricao?: string,
  equipamento?: string
): boolean {
  if (!codigoInfracao && !descricao && !equipamento) return false;

  // Códigos de infração comuns de radar
  const codigosRadar = [
    '74630', // Excesso de velocidade até 20%
    '74640', // Excesso de velocidade de 20% a 50%
    '74550', // Excesso de velocidade acima de 50%
  ];

  if (codigoInfracao && codigosRadar.includes(codigoInfracao)) {
    return true;
  }

  // Palavras-chave na descrição
  const palavrasRadar = [
    'velocidade',
    'radar',
    'lombada',
    'pardal',
    'equipamento',
  ];

  const textoCompleto = `${descricao || ''} ${equipamento || ''}`.toLowerCase();
  
  return palavrasRadar.some(palavra => textoCompleto.includes(palavra));
}

/** Obter informações sobre o equipamento */
export function getEquipamentoInfo(equipamento: string): {
  tipo: string;
  requerCalibracao: boolean;
  tolerancia: number;
  observacoes: string[];
} {
  const equipamentoLower = equipamento.toLowerCase();

  if (equipamentoLower.includes('radar fixo')) {
    return {
      tipo: 'Radar Fixo',
      requerCalibracao: true,
      tolerancia: 7, // 7 km/h ou 7%
      observacoes: [
        'Deve ter sinalização prévia obrigatória',
        'Calibração anual obrigatória',
        'Certificação Inmetro necessária',
      ],
    };
  }

  if (equipamentoLower.includes('radar móvel')) {
    return {
      tipo: 'Radar Móvel',
      requerCalibracao: true,
      tolerancia: 7,
      observacoes: [
        'Operação deve ser visível ao condutor',
        'Calibração semestral obrigatória',
        'Agente deve estar identificado',
      ],
    };
  }

  if (equipamentoLower.includes('lombada')) {
    return {
      tipo: 'Lombada Eletrônica',
      requerCalibracao: true,
      tolerancia: 7,
      observacoes: [
        'Sinalização horizontal e vertical obrigatória',
        'Deve respeitar padrões de instalação',
        'Calibração anual necessária',
      ],
    };
  }

  return {
    tipo: 'Equipamento Genérico',
    requerCalibracao: true,
    tolerancia: 7,
    observacoes: [
      'Verificar certificação Inmetro',
      'Confirmar calibração em dia',
    ],
  };
}