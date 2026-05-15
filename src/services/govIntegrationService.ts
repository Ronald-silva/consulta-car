/**
 * Serviço de integração com gov.br e CDT
 * 
 * IMPORTANTE: Este serviço simula integrações futuras.
 * As URLs e fluxos são baseados nos portais oficiais reais.
 */

export interface GovBrAuthResult {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  error?: string;
}

export interface CDTVehicle {
  placa: string;
  renavam: string;
  marca: string;
  modelo: string;
  anoFabricacao: number;
  anoModelo: number;
  cor: string;
  categoria: string;
  situacao: 'regular' | 'irregular' | 'bloqueado';
}

export interface SNESubscriptionResult {
  success: boolean;
  vehiclesSubscribed: string[];
  message?: string;
  error?: string;
}

export interface MultaGovBr {
  numeroAuto: string;
  placa: string;
  dataInfracao: string;
  horaInfracao: string;
  localInfracao: string;
  enquadramento: string;
  descricaoInfracao: string;
  valorOriginal: number;
  valorComDesconto?: number;
  temDesconto: boolean;
  dataVencimento: string;
  orgaoAutuador: string;
  situacao: 'pendente' | 'paga' | 'contestada' | 'cancelada';
  pontos: number;
}

export interface RealInfratorSubmission {
  numeroAuto: string;
  placa: string;
  nomeInfrator: string;
  cpfInfrator: string;
  cnhInfrator: string;
  observacoes?: string;
}

/**
 * URLs oficiais dos portais gov.br
 */
export const GOV_BR_URLS = {
  // Portal principal
  login: 'https://sso.acesso.gov.br/login',
  
  // CDT - Carteira Digital de Trânsito
  cdtApp: 'https://play.google.com/store/apps/details?id=br.gov.serpro.cnhe',
  cdtWeb: 'https://portalservicos.denatran.serpro.gov.br/',
  
  // SNE - Sistema de Notificação Eletrônica
  sneAdesao: 'https://portalservicos.denatran.serpro.gov.br/sne/',
  sneConsulta: 'https://portalservicos.denatran.serpro.gov.br/sne/consulta',
  
  // Multas e infrações
  multasConsulta: 'https://portalservicos.denatran.serpro.gov.br/multas/',
  realInfrator: 'https://portalservicos.denatran.serpro.gov.br/indicacao-real-infrator/',
  
  // INMETRO
  inmetro: 'https://www.inmetro.gov.br/',
  
  // Documentação
  cdtManual: 'https://www.gov.br/pt-br/servicos/obter-a-carteira-digital-de-transito',
  sneManual: 'https://www.gov.br/pt-br/servicos/aderir-ao-sistema-de-notificacao-eletronica-sne',
} as const;

/**
 * Simular autenticação gov.br
 * Na implementação real, seria feito via OAuth2/OpenID Connect
 */
export async function authenticateGovBr(): Promise<GovBrAuthResult> {
  // Simular delay de autenticação
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simular sucesso (90% das vezes)
  if (Math.random() > 0.1) {
    return {
      success: true,
      accessToken: `mock_token_${Date.now()}`,
      refreshToken: `mock_refresh_${Date.now()}`,
      expiresIn: 3600, // 1 hora
    };
  } else {
    return {
      success: false,
      error: 'Falha na autenticação. Verifique suas credenciais gov.br.',
    };
  }
}

/**
 * Buscar veículos na CDT
 */
export async function fetchCDTVehicles(accessToken: string): Promise<CDTVehicle[]> {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Dados simulados
  const mockVehicles: CDTVehicle[] = [
    {
      placa: 'ABC1234',
      renavam: '12345678901',
      marca: 'VOLKSWAGEN',
      modelo: 'GOL 1.0',
      anoFabricacao: 2020,
      anoModelo: 2021,
      cor: 'BRANCA',
      categoria: 'PARTICULAR',
      situacao: 'regular',
    },
    {
      placa: 'XYZ5678',
      renavam: '98765432109',
      marca: 'CHEVROLET',
      modelo: 'ONIX 1.4',
      anoFabricacao: 2019,
      anoModelo: 2019,
      cor: 'PRATA',
      categoria: 'PARTICULAR',
      situacao: 'regular',
    },
  ];
  
  return mockVehicles;
}

/**
 * Aderir ao SNE para veículos específicos
 */
export async function subscribeToSNE(
  accessToken: string, 
  placas: string[]
): Promise<SNESubscriptionResult> {
  await new Promise(resolve => setTimeout(resolve, 2500));
  
  // Simular sucesso
  return {
    success: true,
    vehiclesSubscribed: placas,
    message: `SNE ativado com sucesso para ${placas.length} veículo(s). Você receberá notificações por email e terá direito a 40% de desconto no pagamento de multas.`,
  };
}

/**
 * Importar multas do gov.br
 */
export async function importMultasFromGovBr(accessToken: string): Promise<MultaGovBr[]> {
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Dados simulados baseados em estrutura real
  const mockMultas: MultaGovBr[] = [
    {
      numeroAuto: '40123456789',
      placa: 'ABC1234',
      dataInfracao: '2024-01-15',
      horaInfracao: '14:30:00',
      localInfracao: 'AV PAULISTA, 1000 - BELA VISTA - SAO PAULO/SP',
      enquadramento: '218-I',
      descricaoInfracao: 'Exceder a velocidade de via em até 20%',
      valorOriginal: 195.23,
      valorComDesconto: 117.14,
      temDesconto: true,
      dataVencimento: '2024-03-15',
      orgaoAutuador: 'DETRAN-SP',
      situacao: 'pendente',
      pontos: 4,
    },
    {
      numeroAuto: '40987654321',
      placa: 'XYZ5678',
      dataInfracao: '2024-02-20',
      horaInfracao: '09:15:00',
      localInfracao: 'R AUGUSTA, 500 - CONSOLACAO - SAO PAULO/SP',
      enquadramento: '181-VIII',
      descricaoInfracao: 'Estacionar em desacordo com a regulamentação',
      valorOriginal: 130.16,
      valorComDesconto: 78.10,
      temDesconto: true,
      dataVencimento: '2024-04-20',
      orgaoAutuador: 'CET-SP',
      situacao: 'pendente',
      pontos: 3,
    },
    {
      numeroAuto: '40555666777',
      placa: 'ABC1234',
      dataInfracao: '2024-03-10',
      horaInfracao: '16:45:00',
      localInfracao: 'AV FARIA LIMA, 2000 - ITAIM BIBI - SAO PAULO/SP',
      enquadramento: '554-I',
      descricaoInfracao: 'Avançar o sinal vermelho do semáforo',
      valorOriginal: 293.47,
      valorComDesconto: 176.08,
      temDesconto: true,
      dataVencimento: '2024-05-10',
      orgaoAutuador: 'DETRAN-SP',
      situacao: 'pendente',
      pontos: 7,
    },
  ];
  
  return mockMultas;
}

/**
 * Indicar real infrator
 */
export async function submitRealInfrator(
  accessToken: string,
  indicacao: RealInfratorSubmission
): Promise<{ success: boolean; protocolo?: string; error?: string }> {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simular sucesso
  if (Math.random() > 0.05) { // 95% de sucesso
    return {
      success: true,
      protocolo: `RI${Date.now().toString().slice(-8)}`,
    };
  } else {
    return {
      success: false,
      error: 'Erro ao enviar indicação. Verifique os dados e tente novamente.',
    };
  }
}

/**
 * Verificar status da conexão gov.br
 */
export async function checkGovBrConnection(accessToken: string): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simular verificação de token
  return accessToken && accessToken.startsWith('mock_token_');
}

/**
 * Calcular economia potencial com SNE
 */
export function calculateSNESavings(multas: MultaGovBr[]): {
  totalOriginal: number;
  totalComDesconto: number;
  economia: number;
  percentualEconomia: number;
} {
  const totalOriginal = multas.reduce((sum, multa) => sum + multa.valorOriginal, 0);
  const totalComDesconto = multas.reduce((sum, multa) => {
    return sum + (multa.temDesconto ? (multa.valorComDesconto || multa.valorOriginal * 0.6) : multa.valorOriginal);
  }, 0);
  
  const economia = totalOriginal - totalComDesconto;
  const percentualEconomia = totalOriginal > 0 ? (economia / totalOriginal) * 100 : 0;
  
  return {
    totalOriginal,
    totalComDesconto,
    economia,
    percentualEconomia,
  };
}

/**
 * Abrir URL oficial do gov.br
 */
export function openGovBrUrl(service: keyof typeof GOV_BR_URLS): void {
  const url = GOV_BR_URLS[service];
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Gerar link de compartilhamento para orientar outros usuários
 */
export function generateSNEGuideLink(): string {
  return `${window.location.origin}?tab=cdt-sne&guide=sne-setup`;
}

/**
 * Validar CPF para indicação de real infrator
 */
export function validateCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/\D/g, '');
  
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Validação dos dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit === 10 || digit === 11) digit = 0;
  if (digit !== parseInt(cleanCPF.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit === 10 || digit === 11) digit = 0;
  if (digit !== parseInt(cleanCPF.charAt(10))) return false;
  
  return true;
}

/**
 * Formatar CPF para exibição
 */
export function formatCPF(cpf: string): string {
  const cleanCPF = cpf.replace(/\D/g, '');
  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formatar CNH para exibição
 */
export function formatCNH(cnh: string): string {
  const cleanCNH = cnh.replace(/\D/g, '');
  return cleanCNH.replace(/(\d{11})/, '$1');
}