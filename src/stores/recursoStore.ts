import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Recurso, WizardState, OcrData, InmetroResult, IaAnalysis, RecorrenteData, FileUpload } from '../types';

interface RecursoStore {
  // Estado atual
  currentRecurso: Partial<Recurso> | null;
  wizardState: WizardState;
  uploadedFile: FileUpload | null;
  
  // Actions
  initializeRecurso: (multaId?: string) => void;
  updateRecurso: (data: Partial<Recurso>) => void;
  setWizardStep: (step: number) => void;
  setWizardLoading: (loading: boolean) => void;
  setWizardError: (error: string | undefined) => void;
  setUploadedFile: (file: FileUpload | null) => void;
  setOcrData: (data: OcrData) => void;
  setInmetroResult: (result: InmetroResult) => void;
  setIaAnalysis: (analysis: IaAnalysis) => void;
  setRecorrenteData: (data: RecorrenteData) => void;
  saveRecurso: () => void;
  loadRecurso: (id: string) => void;
  clearRecurso: () => void;
  
  // Computed
  canGoNext: () => boolean;
  canGoPrev: () => boolean;
  getStepValidation: (step: number) => boolean;
}

const initialWizardState: WizardState = {
  currentStep: 1,
  totalSteps: 6,
  canGoNext: false,
  canGoPrev: false,
  isLoading: false,
  error: undefined,
};

export const useRecursoStore = create<RecursoStore>()(
  persist(
    (set, get) => ({
      currentRecurso: null,
      wizardState: initialWizardState,
      uploadedFile: null,

      initializeRecurso: (multaId) => {
        const newRecurso: Partial<Recurso> = {
          id: `recurso_${Date.now()}`,
          status: 'rascunho',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tipoRecurso: 'defesa_previa',
          argumentosSelecionados: [],
          textoPersonalizado: '',
          documentosAnexados: [],
        };

        set({
          currentRecurso: newRecurso,
          wizardState: { ...initialWizardState },
          uploadedFile: null,
        });
      },

      updateRecurso: (data) => {
        const current = get().currentRecurso;
        if (!current) return;

        const updated = {
          ...current,
          ...data,
          updatedAt: new Date().toISOString(),
        };

        set({ currentRecurso: updated });
      },

      setWizardStep: (step) => {
        const state = get().wizardState;
        const canGoNext = get().canGoNext();
        const canGoPrev = get().canGoPrev();

        set({
          wizardState: {
            ...state,
            currentStep: step,
            canGoNext,
            canGoPrev,
            error: undefined,
          },
        });
      },

      setWizardLoading: (loading) => {
        const state = get().wizardState;
        set({
          wizardState: { ...state, isLoading: loading },
        });
      },

      setWizardError: (error) => {
        const state = get().wizardState;
        set({
          wizardState: { ...state, error, isLoading: false },
        });
      },

      setUploadedFile: (file) => {
        set({ uploadedFile: file });
      },

      setOcrData: (data) => {
        get().updateRecurso({ ocrData: data });
      },

      setInmetroResult: (result) => {
        get().updateRecurso({ inmetroResult: result });
      },

      setIaAnalysis: (analysis) => {
        get().updateRecurso({ iaAnalysis: analysis });
      },

      setRecorrenteData: (data) => {
        get().updateRecurso({ recorrente: data });
      },

      saveRecurso: () => {
        const recurso = get().currentRecurso;
        if (!recurso || !recurso.id) return;

        // Salvar no localStorage (pode ser substituído por API)
        const savedRecursos = JSON.parse(localStorage.getItem('recursos') || '[]');
        const existingIndex = savedRecursos.findIndex((r: Recurso) => r.id === recurso.id);

        if (existingIndex >= 0) {
          savedRecursos[existingIndex] = recurso;
        } else {
          savedRecursos.push(recurso);
        }

        localStorage.setItem('recursos', JSON.stringify(savedRecursos));
      },

      loadRecurso: (id) => {
        const savedRecursos = JSON.parse(localStorage.getItem('recursos') || '[]');
        const recurso = savedRecursos.find((r: Recurso) => r.id === id);

        if (recurso) {
          set({ currentRecurso: recurso });
        }
      },

      clearRecurso: () => {
        set({
          currentRecurso: null,
          wizardState: initialWizardState,
          uploadedFile: null,
        });
      },

      canGoNext: () => {
        const { currentStep } = get().wizardState;
        return get().getStepValidation(currentStep);
      },

      canGoPrev: () => {
        const { currentStep } = get().wizardState;
        return currentStep > 1;
      },

      getStepValidation: (step) => {
        const { currentRecurso, uploadedFile } = get();

        switch (step) {
          case 1: // Upload
            return uploadedFile !== null;
          
          case 2: // OCR
            return currentRecurso?.ocrData !== undefined;
          
          case 3: // Inmetro (opcional para não-radares)
            return true; // Sempre pode prosseguir
          
          case 4: // IA Analysis
            return currentRecurso?.iaAnalysis !== undefined;
          
          case 5: // Editor
            return (
              currentRecurso?.recorrente !== undefined &&
              currentRecurso?.argumentosSelecionados?.length > 0
            );
          
          case 6: // PDF
            return true; // Sempre pode gerar PDF se chegou até aqui
          
          default:
            return false;
        }
      },
    }),
    {
      name: 'recurso-store',
      partialize: (state) => ({
        currentRecurso: state.currentRecurso,
      }),
    }
  )
);