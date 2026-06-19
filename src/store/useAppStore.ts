import { create } from 'zustand';
import {
  modelApi,
  stepApi,
  foldApi,
  paperApi,
  statisticsApi,
} from '../api';
import type {
  Model,
  FoldStep,
  FoldRecord,
  Paper,
  StatisticsSummary,
  CategoryCount,
  MonthlyFold,
  TopModel,
  DifficultyCount,
  TopPaper,
  Category,
  Difficulty,
} from '../../shared/types';

interface AppState {
  models: Model[];
  steps: FoldStep[];
  folds: FoldRecord[];
  paper: Paper[];
  loading: boolean;
  error: string | null;
  
  summary: StatisticsSummary | null;
  categoryStats: CategoryCount[];
  monthlyStats: MonthlyFold[];
  topModels: TopModel[];
  difficultyStats: DifficultyCount[];
  topPaper: TopPaper[];
  
  fetchModels: (filters?: { category?: Category; difficulty?: Difficulty; search?: string }) => Promise<void>;
  fetchSteps: (modelId: string) => Promise<void>;
  fetchFolds: (modelId?: string) => Promise<void>;
  fetchPaper: () => Promise<void>;
  
  createModel: (data: Partial<Model>) => Promise<Model>;
  updateModel: (id: string, data: Partial<Model>) => Promise<Model | undefined>;
  deleteModel: (id: string) => Promise<boolean>;
  
  createStep: (modelId: string, data: Partial<FoldStep>) => Promise<FoldStep>;
  updateStep: (id: string, data: Partial<FoldStep>) => Promise<FoldStep | undefined>;
  deleteStep: (id: string) => Promise<boolean>;
  reorderSteps: (modelId: string, stepIds: string[]) => Promise<boolean>;
  
  createFold: (data: Partial<FoldRecord>) => Promise<FoldRecord>;
  deleteFold: (id: string) => Promise<boolean>;
  
  createPaper: (data: Partial<Paper>) => Promise<Paper>;
  updatePaper: (id: string, data: Partial<Paper>) => Promise<Paper | undefined>;
  deletePaper: (id: string) => Promise<boolean>;
  adjustPaperQuantity: (id: string, amount: number) => Promise<Paper | undefined>;
  
  fetchStatistics: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  models: [],
  steps: [],
  folds: [],
  paper: [],
  loading: false,
  error: null,
  
  summary: null,
  categoryStats: [],
  monthlyStats: [],
  topModels: [],
  difficultyStats: [],
  topPaper: [],
  
  fetchModels: async (filters) => {
    set({ loading: true, error: null });
    try {
      const models = await modelApi.getAll(filters);
      set({ models });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },
  
  fetchSteps: async (modelId) => {
    set({ loading: true, error: null });
    try {
      const steps = await stepApi.getByModelId(modelId);
      set({ steps });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },
  
  fetchFolds: async (modelId) => {
    set({ loading: true, error: null });
    try {
      const folds = modelId 
        ? await foldApi.getByModelId(modelId)
        : await foldApi.getAll();
      set({ folds });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },
  
  fetchPaper: async () => {
    set({ loading: true, error: null });
    try {
      const paper = await paperApi.getAll();
      set({ paper });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },
  
  createModel: async (data) => {
    const model = await modelApi.create(data);
    set((state) => ({ models: [model, ...state.models] }));
    return model;
  },
  
  updateModel: async (id, data) => {
    const updated = await modelApi.update(id, data);
    if (updated) {
      set((state) => ({
        models: state.models.map(m => m.id === id ? updated : m),
      }));
    }
    return updated;
  },
  
  deleteModel: async (id) => {
    await modelApi.delete(id);
    set((state) => ({
      models: state.models.filter(m => m.id !== id),
    }));
    return true;
  },
  
  createStep: async (modelId, data) => {
    const step = await stepApi.create(modelId, data);
    set((state) => ({
      steps: [...state.steps, step].sort((a, b) => a.stepNumber - b.stepNumber),
    }));
    return step;
  },
  
  updateStep: async (id, data) => {
    const updated = await stepApi.update(id, data);
    if (updated) {
      set((state) => ({
        steps: state.steps.map(s => s.id === id ? updated : s)
          .sort((a, b) => a.stepNumber - b.stepNumber),
      }));
    }
    return updated;
  },
  
  deleteStep: async (id) => {
    await stepApi.delete(id);
    set((state) => ({
      steps: state.steps.filter(s => s.id !== id),
    }));
    return true;
  },
  
  reorderSteps: async (modelId, stepIds) => {
    await stepApi.reorder(modelId, stepIds);
    const steps = await stepApi.getByModelId(modelId);
    set({ steps });
    return true;
  },
  
  createFold: async (data) => {
    const fold = await foldApi.create(data);
    set((state) => ({
      folds: [fold, ...state.folds],
    }));
    if (data.paperId) {
      get().fetchPaper();
    }
    return fold;
  },
  
  deleteFold: async (id) => {
    await foldApi.delete(id);
    set((state) => ({
      folds: state.folds.filter(f => f.id !== id),
    }));
    return true;
  },
  
  createPaper: async (data) => {
    const paper = await paperApi.create(data);
    set((state) => ({
      paper: [paper, ...state.paper],
    }));
    return paper;
  },
  
  updatePaper: async (id, data) => {
    const updated = await paperApi.update(id, data);
    if (updated) {
      set((state) => ({
        paper: state.paper.map(p => p.id === id ? updated : p),
      }));
    }
    return updated;
  },
  
  deletePaper: async (id) => {
    await paperApi.delete(id);
    set((state) => ({
      paper: state.paper.filter(p => p.id !== id),
    }));
    return true;
  },
  
  adjustPaperQuantity: async (id, amount) => {
    const updated = await paperApi.adjustQuantity(id, amount);
    if (updated) {
      set((state) => ({
        paper: state.paper.map(p => p.id === id ? updated : p),
      }));
    }
    return updated;
  },
  
  fetchStatistics: async () => {
    set({ loading: true, error: null });
    try {
      const [
        summary,
        categoryStats,
        monthlyStats,
        topModels,
        difficultyStats,
        topPaper,
      ] = await Promise.all([
        statisticsApi.getSummary(),
        statisticsApi.getModelsByCategory(),
        statisticsApi.getFoldsByMonth(),
        statisticsApi.getTopModels(10),
        statisticsApi.getFoldsByDifficulty(),
        statisticsApi.getTopPaper(10),
      ]);
      set({
        summary,
        categoryStats,
        monthlyStats,
        topModels,
        difficultyStats,
        topPaper,
      });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },
}));
