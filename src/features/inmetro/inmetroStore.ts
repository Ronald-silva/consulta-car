import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface EquipamentoInmetro {
  numeroInmetro: string;
  numeroSerie: string;
  tipoEquipamento: string;
  marcaModelo: string;
  uf: string;
  municipio: string;
  local: string;
  status: 'valido' | 'vencido' | 'reprovado' | 'desconhecido';
  dataUltimaVerificacao: string;
  validade: string;
  proximaVerificacao: string;
  historico: Array<{
    data: string;
    status: 'aprovado' | 'reprovado' | 'pendente';
    numeroOrdem: string;
  }>;
}

export interface ConsultaInmetroParams {
  uf: string;
  municipio: string;
  tipoEquipamento: string;
  numeroInmetro: string;
  local: string;
}

interface InmetroState {
  consultasRealizadas: ConsultaInmetroParams[];
  consultaAtual: EquipamentoInmetro | null;
  isLoading: boolean;
  error: string | null;
  consultarEquipamento: (params: ConsultaInmetroParams) => Promise<void>;
  salvarConsulta: (params: ConsultaInmetroParams) => void;
  limparErro: () => void;
  setConsultaAtual: (equipamento: EquipamentoInmetro | null) => void;
}

const mockEquipamento = (params: ConsultaInmetroParams): EquipamentoInmetro => {
  const statuses: Array<'valido' | 'vencido' | 'reprovado'> = ['valido', 'vencido', 'reprovado'];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  
  const hoje = new Date();
  const ultimaVerificacao = new Date(hoje);
  ultimaVerificacao.setMonth(ultimaVerificacao.getMonth() - 6);
  
  let validade = new Date(ultimaVerificacao);
  validade.setFullYear(validade.getFullYear() + 1);
  
  if (randomStatus === 'vencido') {
    validade.setMonth(validade.getMonth() - 2);
  }
  
  const proximaVerificacao = new Date(validade);
  proximaVerificacao.setDate(proximaVerificacao.getDate() - 30);

  return {
    numeroInmetro: params.numeroInmetro || `${Math.floor(Math.random() * 9000) + 1000}.${Math.floor(Math.random() * 90) + 10}.${Math.floor(Math.random() * 90) + 10}.${Math.floor(Math.random() * 900) + 100}.${Math.floor(Math.random() * 90) + 10}`,
    numeroSerie: `SN-${Math.floor(Math.random() * 900000) + 100000}`,
    tipoEquipamento: params.tipoEquipamento || 'Radar fixo',
    marcaModelo: 'Multinova SRL-100',
    uf: params.uf,
    municipio: params.municipio,
    local: params.local,
    status: randomStatus,
    dataUltimaVerificacao: ultimaVerificacao.toISOString(),
    validade: validade.toISOString(),
    proximaVerificacao: proximaVerificacao.toISOString(),
    historico: [
      {
        data: ultimaVerificacao.toISOString(),
        status: 'aprovado',
        numeroOrdem: `ORD-${Math.floor(Math.random() * 90000) + 10000}`
      },
      {
        data: new Date(ultimaVerificacao.getFullYear() - 1, ultimaVerificacao.getMonth(), ultimaVerificacao.getDate()).toISOString(),
        status: 'aprovado',
        numeroOrdem: `ORD-${Math.floor(Math.random() * 90000) + 10000}`
      },
      {
        data: new Date(ultimaVerificacao.getFullYear() - 2, ultimaVerificacao.getMonth(), ultimaVerificacao.getDate()).toISOString(),
        status: 'aprovado',
        numeroOrdem: `ORD-${Math.floor(Math.random() * 90000) + 10000}`
      }
    ]
  };
};

export const useInmetroStore = create<InmetroState>()(
  persist(
    (set, get) => ({
      consultasRealizadas: [],
      consultaAtual: null,
      isLoading: false,
      error: null,

      consultarEquipamento: async (params) => {
        set({ isLoading: true, error: null });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const equipamento = mockEquipamento(params);
          
          set({ 
            consultaAtual: equipamento, 
            isLoading: false 
          });
          
          get().salvarConsulta(params);
        } catch (err) {
          set({ 
            error: 'Erro ao consultar equipamento. Tente novamente.', 
            isLoading: false 
          });
        }
      },

      salvarConsulta: (params) => {
        set((state) => ({
          consultasRealizadas: [
            params,
            ...state.consultasRealizadas.filter(
              c => c.numeroInmetro !== params.numeroInmetro || 
                   c.uf !== params.uf || 
                   c.municipio !== params.municipio
            )
          ].slice(0, 20)
        }));
      },

      limparErro: () => set({ error: null }),

      setConsultaAtual: (equipamento) => set({ consultaAtual: equipamento })
    }),
    {
      name: 'inmetro-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
);
