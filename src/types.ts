export interface Vehicle {
  id: string;
  nickname: string;
  plate: string;
  renavam: string;
  chassis: string;
  brandModel: string;
  year: string;
  /** Ordem manual (arrastar) — menor aparece antes dentro do mesmo grupo */
  sortOrder?: number;
  /** Lista primeiro entre os não fixados */
  pinned?: boolean;
  /** Lembrete opcional — data ISO YYYY-MM-DD (ex.: vencimento licenciamento) */
  reminderDue?: string;
  reminderLabel?: string;
  /** Observações livres (ex.: onde guardou documento) */
  notes?: string;
}

export interface CNH {
  id: string;
  name: string;
  number: string;
  /** Apenas dígitos */
  cpf: string;
  sortOrder?: number;
  pinned?: boolean;
  notes?: string;
}

export interface ServiceLinks {
  ipva: string;
  licenciamento: string;
  multas: string;
  cnhPoints: string;
  cnhClearance: string;
  cnhRenewal: string;
}

// === NOVAS INTERFACES PARA AS FEATURES ===

/** Dados de uma multa para cálculos e recursos */
export interface Multa {
  id: string;
  numeroAuto: string;
  placa: string;
  valor: number;
  dataInfracao: string; // ISO date
  dataVencimento?: string; // ISO date
  orgaoAutuador: string;
  codigoInfracao: string;
  descricaoInfracao: string;
  pontos: number;
  local?: string;
  equipamento?: string;
  velocidadePermitida?: string;
  velocidadeAferida?: string;
  status: 'pendente' | 'paga' | 'recorrida' | 'deferida' | 'indeferida' | 'cancelada';
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}

/** Resultado dos cálculos da calculadora */
export interface CalculationResult {
  valorOriginal: number;
  descontoSNE: number;
  valorComDescontoSNE: number;
  economiaSeGanhar: number;
  valorComJuros: number;
  diasAtraso: number;
  pontosEvitados: number;
  isElegivelSNE: boolean;
  probabilidadeRecurso: number; // 0-1
  recomendacao: string;
}

/** Dados para geração de recurso com IA */
export interface RecursoData {
  multa: Multa;
  tipoRecurso: 'defesa_previa' | 'recurso_jari';
  fundamentacao: string[];
  textoGerado?: string;
  documentosNecessarios: string[];
  prazoLimite?: string; // ISO date
}

/** Histórico veicular completo */
export interface VehicleHistory {
  placa: string;
  renavam: string;
  multas: Multa[];
  debitos: {
    tipo: string;
    valor: number;
    vencimento: string;
    status: string;
  }[];
  restricoes: {
    tipo: string;
    descricao: string;
    dataInclusao: string;
  }[];
  sinistros: {
    data: string;
    tipo: string;
    descricao: string;
  }[];
  recalls: {
    campanha: string;
    descricao: string;
    status: string;
  }[];
  valorFipe?: number;
  riskLevel: 'baixo' | 'medio' | 'alto';
}

/** Configurações do usuário */
export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  lgpdConsent: boolean;
  consentDate?: string;
  autoBackup: boolean;
  geminiApiKey?: string;
}

// === TIPOS PARA ASSISTENTE DE RECURSO COM IA ===

/** Dados extraídos via OCR */
export interface OcrData {
  numeroAuto: string;
  placa: string;
  dataInfracao: string;
  horaInfracao?: string;
  local: string;
  velocidadePermitida?: string;
  velocidadeAferida?: string;
  orgaoAutuador: string;
  valor: number;
  codigoInfracao: string;
  descricaoInfracao: string;
  equipamento?: string;
  agente?: string;
  confidence: number; // 0-1
}

/** Resultado da verificação Inmetro */
export interface InmetroResult {
  status: 'valido' | 'irregular' | 'reprovado' | 'nao_encontrado';
  equipamento?: string;
  certificado?: string;
  dataVencimento?: string;
  observacoes?: string;
}

/** Análise da IA */
export interface IaAnalysis {
  argumentos: {
    tipo: string;
    forca: 'forte' | 'medio' | 'fraco';
    descricao: string;
    fundamentacao: string;
  }[];
  probabilidadeSuccesso: number; // 0-1
  textoBase: string;
  recomendacoes: string[];
  riscos: string[];
}

/** Dados do recorrente */
export interface RecorrenteData {
  nome: string;
  cpf: string;
  cnh: string;
  endereco: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
  };
  telefone?: string;
  email?: string;
}

/** Recurso completo */
export interface Recurso {
  id: string;
  multa: Multa;
  ocrData?: OcrData;
  inmetroResult?: InmetroResult;
  iaAnalysis?: IaAnalysis;
  recorrente: RecorrenteData;
  tipoRecurso: 'defesa_previa' | 'recurso_jari';
  argumentosSelecionados: string[];
  textoPersonalizado: string;
  documentosAnexados: string[];
  status: 'rascunho' | 'finalizado' | 'enviado';
  createdAt: string;
  updatedAt: string;
}

/** Estado do wizard */
export interface WizardState {
  currentStep: number;
  totalSteps: number;
  canGoNext: boolean;
  canGoPrev: boolean;
  isLoading: boolean;
  error?: string;
}

/** Upload de arquivo */
export interface FileUpload {
  file: File;
  preview: string;
  type: 'image' | 'pdf';
  size: number;
}

// === TIPOS PARA LAUDO VEICULAR ===

/** Dados completos do veículo */
export interface VeiculoCompleto {
  placa: string;
  renavam: string;
  chassi?: string;
  marca: string;
  modelo: string;
  anoModelo: number;
  anoFabricacao: number;
  cor: string;
  combustivel: string;
  categoria: string;
  cilindrada?: string;
  potencia?: string;
  municipio?: string;
  uf?: string;
}

/** Débitos do veículo */
export interface Debito {
  tipo: 'ipva' | 'licenciamento' | 'dpvat' | 'taxa' | 'multa';
  descricao: string;
  valor: number;
  vencimento: string;
  status: 'pendente' | 'pago' | 'vencido';
  parcela?: string;
}

/** Restrições do veículo */
export interface Restricao {
  tipo: 'roubo_furto' | 'alienacao_fiduciaria' | 'arrendamento' | 'judicial' | 'administrativa' | 'outras';
  descricao: string;
  dataInclusao: string;
  orgao?: string;
  observacoes?: string;
}

/** Recall do veículo */
export interface Recall {
  campanha: string;
  descricao: string;
  dataInicio: string;
  status: 'pendente' | 'executado' | 'nao_aplicavel';
  risco: 'baixo' | 'medio' | 'alto';
}

/** Histórico de proprietários */
export interface HistoricoProprietario {
  sequencia: number;
  dataTransferencia: string;
  municipio?: string;
  uf?: string;
  tipoTransferencia?: string;
}

/** Dados FIPE */
export interface DadosFipe {
  codigoFipe: string;
  valor: number;
  mesReferencia: string;
  combustivel: string;
  siglaCombustivel: string;
}

/** Consulta veicular completa */
export interface ConsultaVeicular {
  id: string;
  veiculo: VeiculoCompleto;
  multas: Multa[];
  debitos: Debito[];
  restricoes: Restricao[];
  recalls: Recall[];
  historicoProprietarios: HistoricoProprietario[];
  dadosFipe?: DadosFipe;
  consultadoEm: string;
  riskLevel: 'baixo' | 'medio' | 'alto';
  score: number; // 0-100
}

/** Configurações do laudo */
export interface LaudoConfig {
  incluirFotos: boolean;
  nomeComprador?: string;
  nomeVendedor?: string;
  valorAnunciado?: number;
  observacoes?: string;
  finalidade: 'compra' | 'venda' | 'financiamento' | 'seguro' | 'outros';
}

/** Laudo completo */
export interface LaudoVeicular {
  id: string;
  numeroLaudo: string;
  consulta: ConsultaVeicular;
  config: LaudoConfig;
  fotosVeiculo?: string[];
  analiseRisco: {
    nivel: 'baixo' | 'medio' | 'alto';
    pontuacao: number;
    fatoresPositivos: string[];
    fatoresNegativos: string[];
    recomendacao: string;
  };
  sugestaoPreco: {
    fipe: number;
    ajusteRecomendado: number;
    precoSugerido: number;
    justificativa: string;
  };
  createdAt: string;
  updatedAt: string;
}