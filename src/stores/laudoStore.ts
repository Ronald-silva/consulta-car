import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ConsultaVeicular, LaudoVeicular, LaudoConfig } from '../types';

interface LaudoStore {
  // Estado atual
  currentConsulta: ConsultaVeicular | null;
  currentLaudo: LaudoVeicular | null;
  isLoading: boolean;
  error: string | undefined;
  
  // Histórico
  consultasRealizadas: ConsultaVeicular[];
  laudosGerados: LaudoVeicular[];
  
  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | undefined) => void;
  setConsulta: (consulta: ConsultaVeicular) => void;
  setLaudo: (laudo: LaudoVeicular) => void;
  clearConsulta: () => void;
  clearLaudo: () => void;
  
  // Histórico
  addConsultaToHistory: (consulta: ConsultaVeicular) => void;
  addLaudoToHistory: (laudo: LaudoVeicular) => void;
  getConsultaById: (id: string) => ConsultaVeicular | undefined;
  getLaudoById: (id: string) => LaudoVeicular | undefined;
  
  // Computed
  getTotalDebitos: () => number;
  getTotalMultas: () => number;
  hasRestrictions: () => boolean;
  getRiskFactors: () => { positive: string[]; negative: string[] };
}

export const useLaudoStore = create<LaudoStore>()(
  persist(
    (set, get) => ({
      currentConsulta: null,
      currentLaudo: null,
      isLoading: false,
      error: undefined,
      consultasRealizadas: [],
      laudosGerados: [],

      setLoading: (loading) => set({ isLoading: loading }),
      
      setError: (error) => set({ error, isLoading: false }),
      
      setConsulta: (consulta) => {
        set({ currentConsulta: consulta, error: undefined });
        get().addConsultaToHistory(consulta);
      },
      
      setLaudo: (laudo) => {
        set({ currentLaudo: laudo });
        get().addLaudoToHistory(laudo);
      },
      
      clearConsulta: () => set({ currentConsulta: null, error: undefined }),
      
      clearLaudo: () => set({ currentLaudo: null }),

      addConsultaToHistory: (consulta) => {
        const { consultasRealizadas } = get();
        const exists = consultasRealizadas.find(c => c.id === consulta.id);
        
        if (!exists) {
          const updated = [consulta, ...consultasRealizadas].slice(0, 50); // Manter últimas 50
          set({ consultasRealizadas: updated });
        }
      },

      addLaudoToHistory: (laudo) => {
        const { laudosGerados } = get();
        const exists = laudosGerados.find(l => l.id === laudo.id);
        
        if (!exists) {
          const updated = [laudo, ...laudosGerados].slice(0, 20); // Manter últimos 20
          set({ laudosGerados: updated });
        }
      },

      getConsultaById: (id) => {
        const { consultasRealizadas } = get();
        return consultasRealizadas.find(c => c.id === id);
      },

      getLaudoById: (id) => {
        const { laudosGerados } = get();
        return laudosGerados.find(l => l.id === id);
      },

      getTotalDebitos: () => {
        const { currentConsulta } = get();
        if (!currentConsulta) return 0;
        
        return currentConsulta.debitos.reduce((total, debito) => {
          return debito.status !== 'pago' ? total + debito.valor : total;
        }, 0);
      },

      getTotalMultas: () => {
        const { currentConsulta } = get();
        if (!currentConsulta) return 0;
        
        return currentConsulta.multas.reduce((total, multa) => {
          return multa.status === 'pendente' ? total + multa.valor : total;
        }, 0);
      },

      hasRestrictions: () => {
        const { currentConsulta } = get();
        return currentConsulta ? currentConsulta.restricoes.length > 0 : false;
      },

      getRiskFactors: () => {
        const { currentConsulta } = get();
        const positive: string[] = [];
        const negative: string[] = [];

        if (!currentConsulta) {
          return { positive, negative };
        }

        // Fatores positivos
        if (currentConsulta.multas.length === 0) {
          positive.push('Sem multas pendentes');
        }
        
        if (currentConsulta.debitos.filter(d => d.status !== 'pago').length === 0) {
          positive.push('Sem débitos pendentes');
        }
        
        if (currentConsulta.restricoes.length === 0) {
          positive.push('Sem restrições');
        }
        
        if (currentConsulta.recalls.filter(r => r.status === 'pendente').length === 0) {
          positive.push('Recalls em dia');
        }
        
        if (currentConsulta.historicoProprietarios.length <= 3) {
          positive.push('Poucos proprietários anteriores');
        }

        // Fatores negativos
        if (currentConsulta.multas.length > 0) {
          negative.push(`${currentConsulta.multas.length} multa(s) pendente(s)`);
        }
        
        if (currentConsulta.debitos.filter(d => d.status !== 'pago').length > 0) {
          negative.push('Débitos em aberto');
        }
        
        if (currentConsulta.restricoes.length > 0) {
          negative.push(`${currentConsulta.restricoes.length} restrição(ões)`);
        }
        
        if (currentConsulta.recalls.filter(r => r.status === 'pendente' && r.risco === 'alto').length > 0) {
          negative.push('Recalls críticos pendentes');
        }
        
        if (currentConsulta.historicoProprietarios.length > 5) {
          negative.push('Muitos proprietários anteriores');
        }

        return { positive, negative };
      },
    }),
    {
      name: 'laudo-store',
      partialize: (state) => ({
        consultasRealizadas: state.consultasRealizadas,
        laudosGerados: state.laudosGerados,
      }),
    }
  )
);