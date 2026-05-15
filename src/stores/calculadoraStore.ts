import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MultaCalculadora {
  id: string;
  numeroAuto: string;
  placa: string;
  valorOriginal: number;
  valorComDescontoSNE: number;
  descricao: string;
  dataInfracao: string;
  orgaoAutuador: string;
  pontos: number;
  prazoRecurso?: string;
  temDescontoSNE: boolean;
  // Dados calculados
  chanceSuccessoRecurso: number; // 0-100
  valorComJuros: number;
  pontosEvitados: number;
}

export interface CenarioEconomia {
  id: 'sne' | 'recurso' | 'integral';
  nome: string;
  descricao: string;
  valor: number;
  economia: number;
  pontos: number;
  prazo: string;
  vantagens: string[];
  desvantagens: string[];
  recomendado: boolean;
  cor: string;
}

export interface RelatorioEconomia {
  id: string;
  multasAnalisadas: MultaCalculadora[];
  economiaTotal: number;
  economiaSNE: number;
  economiaRecursos: number;
  pontosEvitados: number;
  melhorEstrategia: string;
  geradoEm: string;
}

interface CalculadoraStore {
  // Estado atual
  multaSelecionada: MultaCalculadora | null;
  cenarios: CenarioEconomia[];
  isCalculating: boolean;
  error: string | undefined;
  
  // Histórico e relatórios
  calculosRealizados: MultaCalculadora[];
  relatoriosGerados: RelatorioEconomia[];
  
  // Dashboard geral
  resumoEconomia: {
    totalMultas: number;
    valorTotal: number;
    economiaMaxima: number;
    pontosRisco: number;
  };
  
  // Actions - Cálculos
  selecionarMulta: (multa: MultaCalculadora) => void;
  calcularCenarios: (multa: MultaCalculadora) => Promise<void>;
  calcularChanceRecurso: (multa: MultaCalculadora) => Promise<number>;
  
  // Actions - Dashboard
  atualizarResumoEconomia: () => void;
  importarMultasSNE: () => Promise<void>;
  
  // Actions - Relatórios
  gerarRelatorioEconomia: (multas: MultaCalculadora[]) => Promise<RelatorioEconomia>;
  salvarRelatorio: (relatorio: RelatorioEconomia) => void;
  
  // Actions - Histórico
  adicionarCalculoRealizado: (multa: MultaCalculadora) => void;
  limparHistorico: () => void;
  
  // Actions - General
  setCalculating: (calculating: boolean) => void;
  setError: (error: string | undefined) => void;
  clearError: () => void;
}

export const useCalculadoraStore = create<CalculadoraStore>()(
  persist(
    (set, get) => ({
      // Estados iniciais
      multaSelecionada: null,
      cenarios: [],
      isCalculating: false,
      error: undefined,
      calculosRealizados: [],
      relatoriosGerados: [],
      resumoEconomia: {
        totalMultas: 0,
        valorTotal: 0,
        economiaMaxima: 0,
        pontosRisco: 0,
      },

      // Selecionar multa para cálculo
      selecionarMulta: (multa) => {
        set({ multaSelecionada: multa, error: undefined });
        get().calcularCenarios(multa);
      },

      // Calcular cenários de economia
      calcularCenarios: async (multa) => {
        set({ isCalculating: true, error: undefined });
        
        try {
          // Calcular chance de sucesso no recurso
          const chanceRecurso = await get().calcularChanceRecurso(multa);
          
          // Calcular valor com juros (após vencimento)
          const valorComJuros = multa.valorOriginal * 1.2; // 20% de juros
          
          // Cenário 1: Pagar com desconto SNE
          const cenarioSNE: CenarioEconomia = {
            id: 'sne',
            nome: 'Pagar com SNE',
            descricao: '40% de desconto imediato',
            valor: multa.valorComDescontoSNE,
            economia: multa.valorOriginal - multa.valorComDescontoSNE,
            pontos: multa.pontos, // Pontos são aplicados
            prazo: 'Até o vencimento',
            vantagens: [
              '40% de desconto garantido',
              'Pagamento imediato',
              'Sem risco de juros',
              'Processo simples'
            ],
            desvantagens: [
              'Pontos são aplicados na CNH',
              'Admite a infração'
            ],
            recomendado: chanceRecurso < 60,
            cor: 'green'
          };

          // Cenário 2: Recorrer com IA
          const economiaRecurso = chanceRecurso > 50 ? multa.valorOriginal : 0;
          const cenarioRecurso: CenarioEconomia = {
            id: 'recurso',
            nome: 'Recorrer com IA',
            descricao: `${chanceRecurso}% de chance de sucesso`,
            valor: chanceRecurso > 50 ? 0 : multa.valorOriginal,
            economia: economiaRecurso,
            pontos: chanceRecurso > 50 ? 0 : multa.pontos,
            prazo: '15-30 dias para análise',
            vantagens: [
              `${chanceRecurso}% de chance de cancelamento`,
              'Evita pontos na CNH se ganhar',
              'Recurso gerado automaticamente',
              'Sem custo adicional'
            ],
            desvantagens: [
              'Processo pode demorar',
              'Risco de perder e pagar integral',
              'Requer documentação'
            ],
            recomendado: chanceRecurso >= 60,
            cor: 'blue'
          };

          // Cenário 3: Não fazer nada (pagar integral com juros)
          const cenarioIntegral: CenarioEconomia = {
            id: 'integral',
            nome: 'Pagar Integral',
            descricao: 'Após vencimento com juros',
            valor: valorComJuros,
            economia: 0,
            pontos: multa.pontos,
            prazo: 'Após vencimento',
            vantagens: [
              'Não precisa fazer nada agora'
            ],
            desvantagens: [
              'Valor 20% maior com juros',
              'Pontos aplicados na CNH',
              'Risco de suspensão da CNH',
              'Pode gerar mais complicações'
            ],
            recomendado: false,
            cor: 'red'
          };

          const cenarios = [cenarioSNE, cenarioRecurso, cenarioIntegral];
          
          set({ 
            cenarios,
            multaSelecionada: {
              ...multa,
              chanceSuccessoRecurso: chanceRecurso,
              valorComJuros,
              pontosEvitados: chanceRecurso > 50 ? multa.pontos : 0
            },
            isCalculating: false 
          });

          // Adicionar ao histórico
          get().adicionarCalculoRealizado({
            ...multa,
            chanceSuccessoRecurso: chanceRecurso,
            valorComJuros,
            pontosEvitados: chanceRecurso > 50 ? multa.pontos : 0
          });

        } catch (error) {
          set({ 
            error: 'Erro ao calcular cenários. Tente novamente.',
            isCalculating: false 
          });
        }
      },

      // Calcular chance de sucesso no recurso usando IA
      calcularChanceRecurso: async (multa) => {
        // Simular análise de IA baseada em fatores da multa
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        let chance = 30; // Base
        
        // Fatores que aumentam chance de sucesso
        if (multa.descricao.toLowerCase().includes('radar')) {
          chance += 25; // Radares têm mais problemas técnicos
        }
        
        if (multa.descricao.toLowerCase().includes('velocidade')) {
          chance += 15; // Multas de velocidade são mais contestáveis
        }
        
        if (multa.orgaoAutuador.includes('CET')) {
          chance += 10; // CET tem mais irregularidades
        }
        
        // Valor da multa (multas mais caras têm mais chance)
        if (multa.valorOriginal > 500) {
          chance += 20;
        } else if (multa.valorOriginal > 200) {
          chance += 10;
        }
        
        // Pontos (multas com mais pontos valem mais a pena contestar)
        if (multa.pontos >= 7) {
          chance += 15;
        } else if (multa.pontos >= 4) {
          chance += 10;
        }
        
        // Adicionar variação aleatória
        chance += Math.random() * 20 - 10;
        
        // Garantir que fique entre 15 e 85
        return Math.max(15, Math.min(85, Math.round(chance)));
      },

      // Atualizar resumo geral de economia
      atualizarResumoEconomia: () => {
        const { calculosRealizados } = get();
        
        const totalMultas = calculosRealizados.length;
        const valorTotal = calculosRealizados.reduce((sum, multa) => sum + multa.valorOriginal, 0);
        
        // Calcular economia máxima (melhor cenário para cada multa)
        const economiaMaxima = calculosRealizados.reduce((sum, multa) => {
          const economiaSNE = multa.valorOriginal - multa.valorComDescontoSNE;
          const economiaRecurso = multa.chanceSuccessoRecurso > 60 ? multa.valorOriginal : 0;
          return sum + Math.max(economiaSNE, economiaRecurso);
        }, 0);
        
        const pontosRisco = calculosRealizados.reduce((sum, multa) => sum + multa.pontos, 0);
        
        set({
          resumoEconomia: {
            totalMultas,
            valorTotal,
            economiaMaxima,
            pontosRisco
          }
        });
      },

      // Importar multas do SNE
      importarMultasSNE: async () => {
        set({ isCalculating: true, error: undefined });
        
        try {
          // Simular importação de multas (integração com CDT/SNE store)
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const multasSimuladas: MultaCalculadora[] = [
            {
              id: 'calc-1',
              numeroAuto: '40123456789',
              placa: 'ABC1234',
              valorOriginal: 195.23,
              valorComDescontoSNE: 117.14,
              descricao: 'Excesso de velocidade em até 20%',
              dataInfracao: '2024-01-15',
              orgaoAutuador: 'DETRAN-SP',
              pontos: 4,
              prazoRecurso: '2024-03-15',
              temDescontoSNE: true,
              chanceSuccessoRecurso: 0,
              valorComJuros: 0,
              pontosEvitados: 0
            },
            {
              id: 'calc-2',
              numeroAuto: '40987654321',
              placa: 'XYZ5678',
              valorOriginal: 293.47,
              valorComDescontoSNE: 176.08,
              descricao: 'Avançar sinal vermelho',
              dataInfracao: '2024-02-20',
              orgaoAutuador: 'CET-SP',
              pontos: 7,
              prazoRecurso: '2024-04-20',
              temDescontoSNE: true,
              chanceSuccessoRecurso: 0,
              valorComJuros: 0,
              pontosEvitados: 0
            }
          ];
          
          set({ 
            calculosRealizados: multasSimuladas,
            isCalculating: false 
          });
          
          get().atualizarResumoEconomia();
          
        } catch (error) {
          set({ 
            error: 'Erro ao importar multas. Tente novamente.',
            isCalculating: false 
          });
        }
      },

      // Gerar relatório de economia
      gerarRelatorioEconomia: async (multas) => {
        set({ isCalculating: true });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const valorTotal = multas.reduce((sum, m) => sum + m.valorOriginal, 0);
          const economiaSNE = multas.reduce((sum, m) => sum + (m.valorOriginal - m.valorComDescontoSNE), 0);
          const economiaRecursos = multas.reduce((sum, m) => {
            return sum + (m.chanceSuccessoRecurso > 60 ? m.valorOriginal : 0);
          }, 0);
          
          const economiaTotal = Math.max(economiaSNE, economiaRecursos);
          const pontosEvitados = multas.reduce((sum, m) => sum + m.pontosEvitados, 0);
          
          let melhorEstrategia = 'Mista';
          if (economiaSNE > economiaRecursos * 0.8) {
            melhorEstrategia = 'Pagar com desconto SNE';
          } else if (economiaRecursos > economiaSNE * 1.2) {
            melhorEstrategia = 'Recorrer com IA';
          }
          
          const relatorio: RelatorioEconomia = {
            id: `relatorio-${Date.now()}`,
            multasAnalisadas: multas,
            economiaTotal,
            economiaSNE,
            economiaRecursos,
            pontosEvitados,
            melhorEstrategia,
            geradoEm: new Date().toISOString()
          };
          
          set({ isCalculating: false });
          return relatorio;
          
        } catch (error) {
          set({ 
            error: 'Erro ao gerar relatório.',
            isCalculating: false 
          });
          throw error;
        }
      },

      // Salvar relatório
      salvarRelatorio: (relatorio) => {
        set((state) => ({
          relatoriosGerados: [relatorio, ...state.relatoriosGerados].slice(0, 10) // Manter últimos 10
        }));
      },

      // Adicionar cálculo ao histórico
      adicionarCalculoRealizado: (multa) => {
        set((state) => {
          const exists = state.calculosRealizados.find(m => m.id === multa.id);
          if (exists) {
            return {
              calculosRealizados: state.calculosRealizados.map(m => 
                m.id === multa.id ? multa : m
              )
            };
          } else {
            return {
              calculosRealizados: [multa, ...state.calculosRealizados].slice(0, 50) // Manter últimos 50
            };
          }
        });
        
        get().atualizarResumoEconomia();
      },

      // Limpar histórico
      limparHistorico: () => {
        set({ 
          calculosRealizados: [],
          resumoEconomia: {
            totalMultas: 0,
            valorTotal: 0,
            economiaMaxima: 0,
            pontosRisco: 0
          }
        });
      },

      // Actions gerais
      setCalculating: (calculating) => set({ isCalculating: calculating }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: undefined }),
    }),
    {
      name: 'calculadora-store',
      partialize: (state) => ({
        calculosRealizados: state.calculosRealizados,
        relatoriosGerados: state.relatoriosGerados,
        resumoEconomia: state.resumoEconomia,
      }),
    }
  )
);