import type { 
  VeiculoCompleto, 
  ConsultaVeicular, 
  Debito, 
  Restricao, 
  Recall, 
  HistoricoProprietario,
  DadosFipe,
  Multa 
} from '../types';

/** Simular consulta completa do veículo */
export async function consultarVeiculo(
  placa: string,
  renavam?: string,
  onProgress?: (step: string, progress: number) => void
): Promise<ConsultaVeicular> {
  const placaNormalizada = placa.replace(/[^A-Z0-9]/g, '').toUpperCase();
  
  // Simular steps de consulta
  const steps = [
    { name: 'Buscando dados do veículo...', duration: 1500 },
    { name: 'Consultando multas...', duration: 2000 },
    { name: 'Verificando débitos...', duration: 1500 },
    { name: 'Checando restrições...', duration: 1000 },
    { name: 'Consultando recalls...', duration: 800 },
    { name: 'Buscando histórico...', duration: 1200 },
    { name: 'Consultando tabela FIPE...', duration: 1000 },
    { name: 'Finalizando consulta...', duration: 500 },
  ];

  let totalProgress = 0;
  const stepProgress = 100 / steps.length;

  for (const step of steps) {
    onProgress?.(step.name, totalProgress);
    await new Promise(resolve => setTimeout(resolve, step.duration));
    totalProgress += stepProgress;
  }

  onProgress?.('Consulta concluída!', 100);

  // Gerar dados mockados baseados na placa
  const veiculo = generateMockVeiculo(placaNormalizada, renavam);
  const multas = generateMockMultas(placaNormalizada);
  const debitos = generateMockDebitos(placaNormalizada);
  const restricoes = generateMockRestricoes(placaNormalizada);
  const recalls = generateMockRecalls(veiculo.marca, veiculo.modelo);
  const historicoProprietarios = generateMockHistorico(placaNormalizada);
  const dadosFipe = generateMockFipe(veiculo);

  // Calcular risk level e score
  const { riskLevel, score } = calculateRiskAssessment(multas, debitos, restricoes, recalls);

  const consulta: ConsultaVeicular = {
    id: `consulta_${Date.now()}`,
    veiculo,
    multas,
    debitos,
    restricoes,
    recalls,
    historicoProprietarios,
    dadosFipe,
    consultadoEm: new Date().toISOString(),
    riskLevel,
    score,
  };

  return consulta;
}

/** Gerar dados mockados do veículo */
function generateMockVeiculo(placa: string, renavam?: string): VeiculoCompleto {
  const marcas = ['TOYOTA', 'VOLKSWAGEN', 'CHEVROLET', 'FORD', 'HONDA', 'HYUNDAI', 'FIAT'];
  const modelos = {
    'TOYOTA': ['COROLLA', 'HILUX', 'ETIOS', 'YARIS'],
    'VOLKSWAGEN': ['GOL', 'POLO', 'JETTA', 'TIGUAN'],
    'CHEVROLET': ['ONIX', 'CRUZE', 'S10', 'TRACKER'],
    'FORD': ['KA', 'FOCUS', 'RANGER', 'ECOSPORT'],
    'HONDA': ['CIVIC', 'FIT', 'HR-V', 'CITY'],
    'HYUNDAI': ['HB20', 'CRETA', 'TUCSON', 'ELANTRA'],
    'FIAT': ['UNO', 'ARGO', 'TORO', 'STRADA'],
  };

  const cores = ['BRANCO', 'PRATA', 'PRETO', 'VERMELHO', 'AZUL', 'CINZA'];
  const combustiveis = ['FLEX', 'GASOLINA', 'DIESEL', 'ETANOL'];

  // Usar hash da placa para gerar dados consistentes
  const hash = placa.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const marca = marcas[hash % marcas.length];
  const modelo = modelos[marca][hash % modelos[marca].length];
  const anoModelo = 2015 + (hash % 9); // 2015-2023
  const cor = cores[hash % cores.length];
  const combustivel = combustiveis[hash % combustiveis.length];

  return {
    placa,
    renavam: renavam || `${100000000 + (hash % 900000000)}`,
    chassi: `9BD${placa.slice(0, 3)}${hash.toString().slice(-10)}`,
    marca,
    modelo,
    anoModelo,
    anoFabricacao: anoModelo,
    cor,
    combustivel,
    categoria: 'AUTOMOVEL',
    cilindrada: '1600',
    potencia: '120',
    municipio: 'FORTALEZA',
    uf: 'CE',
  };
}

/** Gerar multas mockadas */
function generateMockMultas(placa: string): Multa[] {
  const hash = placa.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const numMultas = hash % 4; // 0-3 multas

  const multas: Multa[] = [];
  
  for (let i = 0; i < numMultas; i++) {
    const dataInfracao = new Date();
    dataInfracao.setDate(dataInfracao.getDate() - (30 + i * 15));
    
    const dataVencimento = new Date(dataInfracao);
    dataVencimento.setDate(dataVencimento.getDate() + 30);

    multas.push({
      id: `multa_${hash}_${i}`,
      numeroAuto: `${hash}${i}`.padStart(10, '0'),
      placa,
      valor: [130.16, 195.23, 293.47, 880.41][i % 4],
      dataInfracao: dataInfracao.toISOString().split('T')[0],
      dataVencimento: dataVencimento.toISOString().split('T')[0],
      orgaoAutuador: ['DETRAN-CE', 'PRF', 'EPTC'][i % 3],
      codigoInfracao: ['74630', '74640', '70440', '50420'][i % 4],
      descricaoInfracao: [
        'Excesso de velocidade até 20%',
        'Excesso de velocidade de 20% a 50%',
        'Ultrapassagem em local proibido',
        'Estacionar em local proibido'
      ][i % 4],
      pontos: [4, 5, 7, 3][i % 4],
      local: 'Av. Washington Soares, 1000 - Fortaleza/CE',
      equipamento: i < 2 ? 'Radar fixo' : undefined,
      status: 'pendente',
      createdAt: dataInfracao.toISOString(),
      updatedAt: dataInfracao.toISOString(),
    });
  }

  return multas;
}

/** Gerar débitos mockados */
function generateMockDebitos(placa: string): Debito[] {
  const hash = placa.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const debitos: Debito[] = [];

  // IPVA
  if (hash % 3 === 0) {
    debitos.push({
      tipo: 'ipva',
      descricao: 'IPVA 2024',
      valor: 850.00,
      vencimento: '2024-03-31',
      status: 'vencido',
    });
  }

  // Licenciamento
  if (hash % 4 === 0) {
    debitos.push({
      tipo: 'licenciamento',
      descricao: 'Licenciamento Anual 2024',
      valor: 120.50,
      vencimento: '2024-12-31',
      status: 'pendente',
    });
  }

  // Taxa
  if (hash % 5 === 0) {
    debitos.push({
      tipo: 'taxa',
      descricao: 'Taxa de Vistoria',
      valor: 45.00,
      vencimento: '2024-06-30',
      status: 'pendente',
    });
  }

  return debitos;
}

/** Gerar restrições mockadas */
function generateMockRestricoes(placa: string): Restricao[] {
  const hash = placa.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const restricoes: Restricao[] = [];

  // Alienação fiduciária (comum em financiamentos)
  if (hash % 6 === 0) {
    restricoes.push({
      tipo: 'alienacao_fiduciaria',
      descricao: 'Alienação Fiduciária - Banco Itaú S.A.',
      dataInclusao: '2020-05-15',
      orgao: 'DETRAN-CE',
      observacoes: 'Veículo financiado',
    });
  }

  // Restrição judicial (raro)
  if (hash % 15 === 0) {
    restricoes.push({
      tipo: 'judicial',
      descricao: 'Restrição Judicial - Processo nº 123456',
      dataInclusao: '2023-08-20',
      orgao: 'Tribunal de Justiça do CE',
    });
  }

  return restricoes;
}

/** Gerar recalls mockados */
function generateMockRecalls(marca: string, modelo: string): Recall[] {
  const recalls: Recall[] = [];

  // Recalls baseados na marca
  const recallsComuns = {
    'TOYOTA': [
      {
        campanha: 'TC-2023-001',
        descricao: 'Substituição do airbag do motorista',
        risco: 'alto' as const,
      },
    ],
    'VOLKSWAGEN': [
      {
        campanha: 'VW-2023-005',
        descricao: 'Atualização do software do motor',
        risco: 'medio' as const,
      },
    ],
    'CHEVROLET': [
      {
        campanha: 'GM-2024-002',
        descricao: 'Inspeção do sistema de freios',
        risco: 'alto' as const,
      },
    ],
  };

  const marcaRecalls = recallsComuns[marca as keyof typeof recallsComuns];
  
  if (marcaRecalls) {
    marcaRecalls.forEach((recall, index) => {
      recalls.push({
        ...recall,
        dataInicio: '2024-01-15',
        status: index % 2 === 0 ? 'pendente' : 'executado',
      });
    });
  }

  return recalls;
}

/** Gerar histórico de proprietários */
function generateMockHistorico(placa: string): HistoricoProprietario[] {
  const hash = placa.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const numProprietarios = 1 + (hash % 4); // 1-4 proprietários

  const historico: HistoricoProprietario[] = [];
  
  for (let i = 0; i < numProprietarios; i++) {
    const data = new Date();
    data.setFullYear(data.getFullYear() - (numProprietarios - i));
    
    historico.push({
      sequencia: i + 1,
      dataTransferencia: data.toISOString().split('T')[0],
      municipio: ['FORTALEZA', 'SÃO PAULO', 'RIO DE JANEIRO', 'BRASÍLIA'][i % 4],
      uf: ['CE', 'SP', 'RJ', 'DF'][i % 4],
      tipoTransferencia: i === 0 ? 'Primeira habilitação' : 'Transferência',
    });
  }

  return historico;
}

/** Gerar dados FIPE mockados */
function generateMockFipe(veiculo: VeiculoCompleto): DadosFipe {
  const baseValue = 50000; // Valor base
  const ageDiscount = (2024 - veiculo.anoModelo) * 0.1; // 10% por ano
  const finalValue = baseValue * (1 - ageDiscount);

  return {
    codigoFipe: '001234-5',
    valor: Math.round(finalValue),
    mesReferencia: 'dezembro/2024',
    combustivel: veiculo.combustivel,
    siglaCombustivel: veiculo.combustivel === 'FLEX' ? 'G' : veiculo.combustivel.charAt(0),
  };
}

/** Calcular avaliação de risco */
function calculateRiskAssessment(
  multas: Multa[],
  debitos: Debito[],
  restricoes: Restricao[],
  recalls: Recall[]
): { riskLevel: 'baixo' | 'medio' | 'alto'; score: number } {
  let score = 100; // Começar com score máximo

  // Penalizar por multas
  score -= multas.length * 10;
  
  // Penalizar por débitos
  const debitosPendentes = debitos.filter(d => d.status !== 'pago');
  score -= debitosPendentes.length * 15;
  
  // Penalizar por restrições
  score -= restricoes.length * 20;
  
  // Penalizar por recalls críticos
  const recallsCriticos = recalls.filter(r => r.status === 'pendente' && r.risco === 'alto');
  score -= recallsCriticos.length * 25;

  // Garantir que o score não seja negativo
  score = Math.max(0, score);

  // Determinar nível de risco
  let riskLevel: 'baixo' | 'medio' | 'alto';
  if (score >= 80) {
    riskLevel = 'baixo';
  } else if (score >= 50) {
    riskLevel = 'medio';
  } else {
    riskLevel = 'alto';
  }

  return { riskLevel, score };
}

/** Validar placa brasileira */
export function isValidPlaca(placa: string): boolean {
  const placaNormalizada = placa.replace(/[^A-Z0-9]/g, '').toUpperCase();
  
  // Placa antiga: ABC1234
  const placaAntiga = /^[A-Z]{3}[0-9]{4}$/;
  
  // Placa Mercosul: ABC1D23
  const placaMercosul = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;
  
  return placaAntiga.test(placaNormalizada) || placaMercosul.test(placaNormalizada);
}

/** Formatar placa para exibição */
export function formatPlaca(placa: string): string {
  const placaNormalizada = placa.replace(/[^A-Z0-9]/g, '').toUpperCase();
  
  if (placaNormalizada.length === 7) {
    return `${placaNormalizada.slice(0, 3)}-${placaNormalizada.slice(3)}`;
  }
  
  return placaNormalizada;
}