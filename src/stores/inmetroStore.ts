import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface EquipamentoInmetro {
  id: string;
  numeroInmetro: string;
  numeroSerie?: string;
  tipoEquipamento: string;
  uf: string;
  municipio?: string;
  local?: string;
  status: 'valido' | 'irregular' | 'reprovado' | 'nao_encontrado';
  dataUltimaVerificacao?: string;
  dataValidade?: string;
  proximaVerificacao?: string;
  certificado?: string;
  observacoes?: string;
  historicoVerificacoes?: Array<{
    data: string;
    status: string;
    certificado?: string;
  }>;
  consultadoEm: string;
}

export interface ConsultaInmetroParams {
  uf: string;
  municipio?: string;
  tipoEquipamento?: string;
  numeroInmetro?: string;
  local?: string;
}

interface InmetroStore {
  consultasRealizadas: EquipamentoInmetro[];
  consultaAtual: EquipamentoInmetro | null;
  isLoading: boolean;
  error: string | undefined;
  
  consultarEquipamento: (params: ConsultaInmetroParams) => Promise<void>;
  salvarConsulta: (equipamento: EquipamentoInmetro) => void;
  limparConsultaAtual: () => void;
  limparHistorico: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | undefined) => void;
}

const UFS_BRASIL = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const TIPOS_EQUIPAMENTO = [
  'Radar Fixo',
  'Radar Móvel',
  'Radar Portátil',
  'Lombada Eletrônica',
  'Câmera de Monitoramento',
  'Sensor de Velocidade',
  'Outro'
];

export const useInmetroStore = create<InmetroStore>()(
  persist(
    (set, get) => ({
      consultasRealizadas: [],
      consultaAtual: null,
      isLoading: false,
      error: undefined,
      
      consultarEquipamento: async (params) => {
        set({ isLoading: true, error: undefined });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const randomStatus = Math.random();
          let status: EquipamentoInmetro['status'] = 'valido';
          
          if (randomStatus > 0.8) {
            status = 'irregular';
          } else if (randomStatus > 0.6) {
            status = 'reprovado';
          } else if (randomStatus > 0.4) {
            status = 'nao_encontrado';
          }
          
          const hoje = new Date();
          const dataUltimaVerificacao = new Date(hoje);
          dataUltimaVerificacao.setMonth(dataUltimaVerificacao.getMonth() - 6);
          
          const dataValidade = new Date(hoje);
          dataValidade.setMonth(dataValidade.getMonth() + 6);
          
          const equipamento: EquipamentoInmetro = {
            id: `inmetro-${Date.now()}`,
            numeroInmetro: params.numeroInmetro || `INMETRO-${Math.floor(Math.random() * 900000) + 100000}`,
            numeroSerie: `SN-${Math.floor(Math.random() * 90000000) + 10000000}`,
            tipoEquipamento: params.tipoEquipamento || 'Radar Fixo',
            uf: params.uf,
            municipio: params.municipio,
            local: params.local,
            status,
            dataUltimaVerificacao: dataUltimaVerificacao.toISOString().split('T')[0],
            dataValidade: dataValidade.toISOString().split('T')[0],
            proximaVerificacao: dataValidade.toISOString().split('T')[0],
            certificado: status !== 'nao_encontrado' ? `CERT-${Math.floor(Math.random() * 900000) + 100000}` : undefined,
            observacoes: status === 'valido' 
              ? 'Equipamento aferido e em conformidade com a legislação vigente' 
              : status === 'irregular' 
                ? 'Equipamento com certificação vencida ou irregularidades identificadas' 
                : status === 'reprovado' 
                  ? 'Equipamento reprovado na última verificação' 
                  : 'Equipamento não encontrado na base de dados do Inmetro',
            historicoVerificacoes: [
              {
                data: dataUltimaVerificacao.toISOString().split('T')[0],
                status: status === 'valido' ? 'Aprovado' : status === 'irregular' ? 'Irregular' : 'Reprovado',
                certificado: `CERT-${Math.floor(Math.random() * 900000) + 100000}`
              },
              {
                data: new Date(dataUltimaVerificacao.setMonth(dataUltimaVerificacao.getMonth() - 12)).toISOString().split('T')[0],
                status: 'Aprovado',
                certificado: `CERT-${Math.floor(Math.random() * 900000) + 100000}`
              }
            ],
            consultadoEm: new Date().toISOString()
          };
          
          set({ consultaAtual: equipamento, isLoading: false });
          get().salvarConsulta(equipamento);
          
        } catch (error) {
          set({ 
            error: 'Erro ao consultar equipamento. Tente novamente.',
            isLoading: false 
          });
        }
      },
      
      salvarConsulta: (equipamento) => {
        set((state) => {
          const exists = state.consultasRealizadas.find(c => c.numeroInmetro === equipamento.numeroInmetro);
          if (exists) {
            return {
              consultasRealizadas: state.consultasRealizadas.map(c => 
                c.numeroInmetro === equipamento.numeroInmetro ? equipamento : c
              )
            };
          } else {
            return {
              consultasRealizadas: [equipamento, ...state.consultasRealizadas].slice(0, 50)
            };
          }
        });
      },
      
      limparConsultaAtual: () => set({ consultaAtual: null, error: undefined }),
      
      limparHistorico: () => set({ consultasRealizadas: [] }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      setError: (error) => set({ error }),
    }),
    {
      name: 'inmetro-store',
      partialize: (state) => ({
        consultasRealizadas: state.consultasRealizadas,
      }),
    }
  )
);

export { UFS_BRASIL, TIPOS_EQUIPAMENTO };
