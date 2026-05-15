import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CDTStatus {
  isActivated: boolean;
  activatedAt?: string;
  govBrConnected: boolean;
  lastSync?: string;
}

export interface SNEStatus {
  isSubscribed: boolean;
  subscribedAt?: string;
  vehiclesSubscribed: string[]; // placas dos veículos
  estimatedSavings: number;
}

export interface MultaImportada {
  id: string;
  numeroAuto: string;
  placa: string;
  dataInfracao: string;
  valorOriginal: number;
  valorComDesconto: number;
  descricao: string;
  orgaoAutuador: string;
  status: 'pendente' | 'paga' | 'contestada';
  temDesconto: boolean;
  prazoRecurso?: string;
  importadaEm: string;
}

export interface RealInfratorIndicacao {
  id: string;
  numeroAuto: string;
  placa: string;
  nomeInfrator: string;
  cpfInfrator: string;
  cnhInfrator: string;
  dataIndicacao: string;
  status: 'enviada' | 'processando' | 'aceita' | 'rejeitada';
  observacoes?: string;
}

interface CDTSNEStore {
  // Estados
  cdtStatus: CDTStatus;
  sneStatus: SNEStatus;
  multasImportadas: MultaImportada[];
  indicacoesRealInfrator: RealInfratorIndicacao[];
  isLoading: boolean;
  error: string | undefined;
  
  // Wizard state
  currentStep: number;
  wizardCompleted: boolean;
  
  // Actions - CDT
  setCDTActivated: (activated: boolean) => void;
  setGovBrConnected: (connected: boolean) => void;
  syncCDT: () => Promise<void>;
  
  // Actions - SNE
  setSNESubscribed: (subscribed: boolean, vehicles?: string[]) => void;
  addVehicleToSNE: (placa: string) => void;
  removeVehicleFromSNE: (placa: string) => void;
  calculateEstimatedSavings: () => void;
  
  // Actions - Multas
  importMultas: () => Promise<MultaImportada[]>;
  addMultaImportada: (multa: MultaImportada) => void;
  updateMultaStatus: (id: string, status: MultaImportada['status']) => void;
  
  // Actions - Real Infrator
  addIndicacaoRealInfrator: (indicacao: Omit<RealInfratorIndicacao, 'id' | 'dataIndicacao' | 'status'>) => void;
  updateIndicacaoStatus: (id: string, status: RealInfratorIndicacao['status']) => void;
  
  // Actions - Wizard
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  completeWizard: () => void;
  resetWizard: () => void;
  
  // Actions - General
  setLoading: (loading: boolean) => void;
  setError: (error: string | undefined) => void;
  clearError: () => void;
}

export const useCDTSNEStore = create<CDTSNEStore>()(
  persist(
    (set, get) => ({
      // Estados iniciais
      cdtStatus: {
        isActivated: false,
        govBrConnected: false,
      },
      sneStatus: {
        isSubscribed: false,
        vehiclesSubscribed: [],
        estimatedSavings: 0,
      },
      multasImportadas: [],
      indicacoesRealInfrator: [],
      isLoading: false,
      error: undefined,
      currentStep: 1,
      wizardCompleted: false,

      // CDT Actions
      setCDTActivated: (activated) => {
        set((state) => ({
          cdtStatus: {
            ...state.cdtStatus,
            isActivated: activated,
            activatedAt: activated ? new Date().toISOString() : undefined,
          },
        }));
      },

      setGovBrConnected: (connected) => {
        set((state) => ({
          cdtStatus: {
            ...state.cdtStatus,
            govBrConnected: connected,
            lastSync: connected ? new Date().toISOString() : state.cdtStatus.lastSync,
          },
        }));
      },

      syncCDT: async () => {
        set({ isLoading: true, error: undefined });
        try {
          // Simular sincronização
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          set((state) => ({
            cdtStatus: {
              ...state.cdtStatus,
              lastSync: new Date().toISOString(),
            },
            isLoading: false,
          }));
        } catch (error) {
          set({ 
            error: 'Erro ao sincronizar com CDT. Tente novamente.',
            isLoading: false 
          });
        }
      },

      // SNE Actions
      setSNESubscribed: (subscribed, vehicles = []) => {
        set((state) => ({
          sneStatus: {
            ...state.sneStatus,
            isSubscribed: subscribed,
            subscribedAt: subscribed ? new Date().toISOString() : undefined,
            vehiclesSubscribed: subscribed ? vehicles : [],
          },
        }));
        
        if (subscribed) {
          get().calculateEstimatedSavings();
        }
      },

      addVehicleToSNE: (placa) => {
        set((state) => ({
          sneStatus: {
            ...state.sneStatus,
            vehiclesSubscribed: [...state.sneStatus.vehiclesSubscribed, placa],
          },
        }));
        get().calculateEstimatedSavings();
      },

      removeVehicleFromSNE: (placa) => {
        set((state) => ({
          sneStatus: {
            ...state.sneStatus,
            vehiclesSubscribed: state.sneStatus.vehiclesSubscribed.filter(p => p !== placa),
          },
        }));
        get().calculateEstimatedSavings();
      },

      calculateEstimatedSavings: () => {
        const { multasImportadas, sneStatus } = get();
        
        // Calcular economia estimada baseada nas multas dos veículos no SNE
        const multasComDesconto = multasImportadas.filter(multa => 
          sneStatus.vehiclesSubscribed.includes(multa.placa) && multa.temDesconto
        );
        
        const economiaTotal = multasComDesconto.reduce((total, multa) => {
          return total + (multa.valorOriginal - multa.valorComDesconto);
        }, 0);
        
        set((state) => ({
          sneStatus: {
            ...state.sneStatus,
            estimatedSavings: economiaTotal,
          },
        }));
      },

      // Multas Actions
      importMultas: async () => {
        set({ isLoading: true, error: undefined });
        
        try {
          // Simular importação de multas do gov.br
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          const multasSimuladas: MultaImportada[] = [
            {
              id: `multa-${Date.now()}-1`,
              numeroAuto: '40123456789',
              placa: 'ABC1234',
              dataInfracao: '2024-01-15',
              valorOriginal: 195.23,
              valorComDesconto: 117.14, // 40% desconto
              descricao: 'Excesso de velocidade em até 20%',
              orgaoAutuador: 'DETRAN-SP',
              status: 'pendente',
              temDesconto: true,
              prazoRecurso: '2024-03-15',
              importadaEm: new Date().toISOString(),
            },
            {
              id: `multa-${Date.now()}-2`,
              numeroAuto: '40987654321',
              placa: 'XYZ5678',
              dataInfracao: '2024-02-20',
              valorOriginal: 130.16,
              valorComDesconto: 78.10,
              descricao: 'Estacionar em local proibido',
              orgaoAutuador: 'CET-SP',
              status: 'pendente',
              temDesconto: true,
              prazoRecurso: '2024-04-20',
              importadaEm: new Date().toISOString(),
            },
          ];
          
          set((state) => ({
            multasImportadas: [...state.multasImportadas, ...multasSimuladas],
            isLoading: false,
          }));
          
          get().calculateEstimatedSavings();
          return multasSimuladas;
          
        } catch (error) {
          set({ 
            error: 'Erro ao importar multas. Verifique sua conexão com gov.br.',
            isLoading: false 
          });
          return [];
        }
      },

      addMultaImportada: (multa) => {
        set((state) => ({
          multasImportadas: [...state.multasImportadas, multa],
        }));
        get().calculateEstimatedSavings();
      },

      updateMultaStatus: (id, status) => {
        set((state) => ({
          multasImportadas: state.multasImportadas.map(multa =>
            multa.id === id ? { ...multa, status } : multa
          ),
        }));
      },

      // Real Infrator Actions
      addIndicacaoRealInfrator: (indicacao) => {
        const novaIndicacao: RealInfratorIndicacao = {
          ...indicacao,
          id: `indicacao-${Date.now()}`,
          dataIndicacao: new Date().toISOString(),
          status: 'enviada',
        };
        
        set((state) => ({
          indicacoesRealInfrator: [...state.indicacoesRealInfrator, novaIndicacao],
        }));
      },

      updateIndicacaoStatus: (id, status) => {
        set((state) => ({
          indicacoesRealInfrator: state.indicacoesRealInfrator.map(indicacao =>
            indicacao.id === id ? { ...indicacao, status } : indicacao
          ),
        }));
      },

      // Wizard Actions
      setCurrentStep: (step) => set({ currentStep: step }),
      
      nextStep: () => {
        const { currentStep } = get();
        if (currentStep < 5) {
          set({ currentStep: currentStep + 1 });
        }
      },
      
      prevStep: () => {
        const { currentStep } = get();
        if (currentStep > 1) {
          set({ currentStep: currentStep - 1 });
        }
      },
      
      completeWizard: () => {
        set({ wizardCompleted: true, currentStep: 5 });
      },
      
      resetWizard: () => {
        set({ currentStep: 1, wizardCompleted: false });
      },

      // General Actions
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: undefined }),
    }),
    {
      name: 'cdt-sne-store',
      partialize: (state) => ({
        cdtStatus: state.cdtStatus,
        sneStatus: state.sneStatus,
        multasImportadas: state.multasImportadas,
        indicacoesRealInfrator: state.indicacoesRealInfrator,
        wizardCompleted: state.wizardCompleted,
      }),
    }
  )
);