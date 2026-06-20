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
  ModelStatus,
  ModelTag,
  PracticeSession,
  StepDifficultyMark,
  Collection,
  StatusHistory,
  TutorialSource,
  FoldResultImage,
  CompletionDegree,
  NeatnessDegree,
} from '../../shared/types';

interface AppState {
  models: Model[];
  steps: FoldStep[];
  folds: FoldRecord[];
  paper: Paper[];
  loading: boolean;
  error: string | null;

  practiceSessions: PracticeSession[];
  currentSession: PracticeSession | null;
  stepDifficultyMarks: StepDifficultyMark[];
  collections: Collection[];
  statusHistories: StatusHistory[];

  summary: StatisticsSummary | null;
  categoryStats: CategoryCount[];
  monthlyStats: MonthlyFold[];
  topModels: TopModel[];
  difficultyStats: DifficultyCount[];
  topPaper: TopPaper[];

  fetchModels: (filters?: { category?: Category; difficulty?: Difficulty; search?: string; status?: ModelStatus; tags?: ModelTag[] }) => Promise<void>;
  fetchSteps: (modelId: string) => Promise<void>;
  fetchFolds: (filters?: { modelId?: string; isRepresentative?: boolean }) => Promise<void>;
  fetchPaper: () => Promise<void>;
  fetchCollections: () => Promise<void>;

  createModel: (data: Partial<Model>) => Promise<Model>;
  updateModel: (id: string, data: Partial<Model>) => Promise<Model | undefined>;
  deleteModel: (id: string) => Promise<boolean>;

  toggleFavorite: (id: string) => Promise<Model | undefined>;
  toggleWishlist: (id: string) => Promise<Model | undefined>;
  updateModelStatus: (id: string, status: ModelStatus, note?: string) => Promise<Model | undefined>;
  updateModelTags: (id: string, tags: ModelTag[]) => Promise<Model | undefined>;
  updateTutorialSources: (id: string, sources: TutorialSource[]) => Promise<Model | undefined>;

  createStep: (modelId: string, data: Partial<FoldStep>) => Promise<FoldStep>;
  updateStep: (id: string, data: Partial<FoldStep>) => Promise<FoldStep | undefined>;
  deleteStep: (id: string) => Promise<boolean>;
  reorderSteps: (modelId: string, stepIds: string[]) => Promise<boolean>;

  createFold: (data: Partial<FoldRecord>) => Promise<FoldRecord>;
  updateFold: (id: string, data: Partial<FoldRecord>) => Promise<FoldRecord | undefined>;
  deleteFold: (id: string) => Promise<boolean>;
  toggleRepresentative: (id: string) => Promise<FoldRecord | undefined>;

  createPaper: (data: Partial<Paper>) => Promise<Paper>;
  updatePaper: (id: string, data: Partial<Paper>) => Promise<Paper | undefined>;
  deletePaper: (id: string) => Promise<boolean>;
  adjustPaperQuantity: (id: string, amount: number) => Promise<Paper | undefined>;

  startPracticeSession: (modelId: string) => Promise<PracticeSession>;
  pausePracticeSession: (sessionId: string) => Promise<PracticeSession | undefined>;
  resumePracticeSession: (sessionId: string) => Promise<PracticeSession | undefined>;
  completePracticeSession: (sessionId: string) => Promise<PracticeSession | undefined>;
  cancelPracticeSession: (sessionId: string) => Promise<PracticeSession | undefined>;
  updateSessionProgress: (sessionId: string, stepIndex: number, action: 'complete' | 'skip' | 'uncomplete') => Promise<PracticeSession | undefined>;

  markStepDifficulty: (modelId: string, stepId: string, isDifficult: boolean, notes?: string) => Promise<StepDifficultyMark | undefined>;
  fetchStepDifficultyMarks: (modelId: string) => Promise<void>;

  createCollection: (data: Partial<Collection>) => Promise<Collection>;
  updateCollection: (id: string, data: Partial<Collection>) => Promise<Collection | undefined>;
  deleteCollection: (id: string) => Promise<boolean>;
  addModelToCollection: (collectionId: string, modelId: string) => Promise<Collection | undefined>;
  removeModelFromCollection: (collectionId: string, modelId: string) => Promise<Collection | undefined>;

  fetchStatistics: () => Promise<void>;
}

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

export const useAppStore = create<AppState>((set, get) => ({
  models: [],
  steps: [],
  folds: [],
  paper: [],
  loading: false,
  error: null,

  practiceSessions: [],
  currentSession: null,
  stepDifficultyMarks: [],
  collections: [],
  statusHistories: [],

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
      const enriched = models.map(m => ({
        tags: [],
        status: '未开始' as ModelStatus,
        isFavorite: false,
        isWishlist: false,
        collectionIds: [],
        tutorialSources: [],
        ...m,
      }));
      set({ models: enriched });
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

  fetchFolds: async (filters) => {
    set({ loading: true, error: null });
    try {
      const folds = filters?.modelId
        ? await foldApi.getByModelId(filters.modelId)
        : await foldApi.getAll();
      const enriched = folds.map(f => ({
        completion: 5 as CompletionDegree,
        neatness: 5 as NeatnessDegree,
        success: true,
        resultImages: [],
        isRepresentative: false,
        ...f,
      }));
      let filtered = enriched;
      if (filters?.isRepresentative) {
        filtered = enriched.filter(f => f.isRepresentative);
      }
      set({ folds: filtered });
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

  fetchCollections: async () => {
    set({ collections: [] });
  },

  createModel: async (data) => {
    const enriched = {
      tags: [],
      status: '未开始' as ModelStatus,
      isFavorite: false,
      isWishlist: false,
      collectionIds: [],
      tutorialSources: [],
      ...data,
    };
    const model = await modelApi.create(enriched);
    set((state) => ({ models: [model, ...state.models] }));
    return model;
  },

  updateModel: async (id, data) => {
    const updated = await modelApi.update(id, data);
    if (updated) {
      set((state) => ({
        models: state.models.map(m => m.id === id ? { ...m, ...updated } : m),
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

  toggleFavorite: async (id) => {
    const model = get().models.find(m => m.id === id);
    if (!model) return undefined;
    const updated = { ...model, isFavorite: !model.isFavorite };
    set((state) => ({
      models: state.models.map(m => m.id === id ? updated : m),
    }));
    return updated;
  },

  toggleWishlist: async (id) => {
    const model = get().models.find(m => m.id === id);
    if (!model) return undefined;
    const updated = { ...model, isWishlist: !model.isWishlist };
    set((state) => ({
      models: state.models.map(m => m.id === id ? updated : m),
    }));
    return updated;
  },

  updateModelStatus: async (id, status, note) => {
    const model = get().models.find(m => m.id === id);
    if (!model) return undefined;
    const history: StatusHistory = {
      id: generateId(),
      modelId: id,
      oldStatus: model.status,
      newStatus: status,
      changedAt: new Date().toISOString(),
      note,
    };
    const updated = { ...model, status, updatedAt: new Date().toISOString() };
    set((state) => ({
      models: state.models.map(m => m.id === id ? updated : m),
      statusHistories: [history, ...state.statusHistories],
    }));
    return updated;
  },

  updateModelTags: async (id, tags) => {
    const model = get().models.find(m => m.id === id);
    if (!model) return undefined;
    const updated = { ...model, tags, updatedAt: new Date().toISOString() };
    set((state) => ({
      models: state.models.map(m => m.id === id ? updated : m),
    }));
    return updated;
  },

  updateTutorialSources: async (id, sources) => {
    const model = get().models.find(m => m.id === id);
    if (!model) return undefined;
    const updated = { ...model, tutorialSources: sources, updatedAt: new Date().toISOString() };
    set((state) => ({
      models: state.models.map(m => m.id === id ? updated : m),
    }));
    return updated;
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
    const enriched = {
      completion: 5 as CompletionDegree,
      neatness: 5 as NeatnessDegree,
      success: true,
      resultImages: [],
      isRepresentative: false,
      ...data,
    };
    const fold = await foldApi.create(enriched);
    set((state) => ({
      folds: [fold, ...state.folds],
    }));
    if (data.paperId) {
      get().fetchPaper();
    }
    return fold;
  },

  updateFold: async (id, data) => {
    const existing = get().folds.find(f => f.id === id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data };
    try {
      await foldApi.update(id, data);
    } catch (e) {}
    set((state) => ({
      folds: state.folds.map(f => f.id === id ? updated : f),
    }));
    return updated;
  },

  deleteFold: async (id) => {
    await foldApi.delete(id);
    set((state) => ({
      folds: state.folds.filter(f => f.id !== id),
    }));
    return true;
  },

  toggleRepresentative: async (id) => {
    const fold = get().folds.find(f => f.id === id);
    if (!fold) return undefined;
    const modelFolds = get().folds.filter(f => f.modelId === fold.modelId);
    if (!fold.isRepresentative) {
      modelFolds.forEach(f => {
        if (f.isRepresentative && f.id !== id) {
          f.isRepresentative = false;
        }
      });
    }
    const updated = { ...fold, isRepresentative: !fold.isRepresentative };
    set((state) => ({
      folds: state.folds.map(f => {
        if (f.id === id) return updated;
        if (f.modelId === fold.modelId && updated.isRepresentative) {
          return { ...f, isRepresentative: false };
        }
        return f;
      }),
    }));
    return updated;
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

  startPracticeSession: async (modelId) => {
    const now = new Date().toISOString();
    const session: PracticeSession = {
      id: generateId(),
      modelId,
      startTime: now,
      endTime: null,
      pauseTimes: [],
      resumeTimes: [],
      currentStepIndex: 0,
      completedSteps: [],
      skippedSteps: [],
      status: '进行中',
      totalElapsedSeconds: 0,
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({
      practiceSessions: [session, ...state.practiceSessions],
      currentSession: session,
    }));
    return session;
  },

  pausePracticeSession: async (sessionId) => {
    const session = get().practiceSessions.find(s => s.id === sessionId);
    if (!session) return undefined;
    const now = new Date().toISOString();
    const start = new Date(session.resumeTimes.length > 0
      ? session.resumeTimes[session.resumeTimes.length - 1]
      : session.startTime).getTime();
    const elapsed = Math.floor((Date.now() - start) / 1000);
    const updated: PracticeSession = {
      ...session,
      pauseTimes: [...session.pauseTimes, now],
      status: '已暂停',
      totalElapsedSeconds: session.totalElapsedSeconds + elapsed,
      updatedAt: now,
    };
    set((state) => ({
      practiceSessions: state.practiceSessions.map(s => s.id === sessionId ? updated : s),
      currentSession: state.currentSession?.id === sessionId ? updated : state.currentSession,
    }));
    return updated;
  },

  resumePracticeSession: async (sessionId) => {
    const session = get().practiceSessions.find(s => s.id === sessionId);
    if (!session) return undefined;
    const now = new Date().toISOString();
    const updated: PracticeSession = {
      ...session,
      resumeTimes: [...session.resumeTimes, now],
      status: '进行中',
      updatedAt: now,
    };
    set((state) => ({
      practiceSessions: state.practiceSessions.map(s => s.id === sessionId ? updated : s),
      currentSession: state.currentSession?.id === sessionId ? updated : state.currentSession,
    }));
    return updated;
  },

  completePracticeSession: async (sessionId) => {
    const session = get().practiceSessions.find(s => s.id === sessionId);
    if (!session) return undefined;
    const now = new Date().toISOString();
    const start = new Date(session.resumeTimes.length > 0 && session.status === '进行中'
      ? session.resumeTimes[session.resumeTimes.length - 1]
      : session.startTime).getTime();
    const elapsed = session.status === '进行中'
      ? Math.floor((Date.now() - start) / 1000)
      : 0;
    const updated: PracticeSession = {
      ...session,
      endTime: now,
      status: '已完成',
      totalElapsedSeconds: session.totalElapsedSeconds + elapsed,
      updatedAt: now,
    };
    set((state) => ({
      practiceSessions: state.practiceSessions.map(s => s.id === sessionId ? updated : s),
      currentSession: state.currentSession?.id === sessionId ? null : state.currentSession,
    }));
    return updated;
  },

  cancelPracticeSession: async (sessionId) => {
    const session = get().practiceSessions.find(s => s.id === sessionId);
    if (!session) return undefined;
    const now = new Date().toISOString();
    const updated: PracticeSession = {
      ...session,
      endTime: now,
      status: '已取消',
      updatedAt: now,
    };
    set((state) => ({
      practiceSessions: state.practiceSessions.map(s => s.id === sessionId ? updated : s),
      currentSession: state.currentSession?.id === sessionId ? null : state.currentSession,
    }));
    return updated;
  },

  updateSessionProgress: async (sessionId, stepIndex, action) => {
    const session = get().practiceSessions.find(s => s.id === sessionId);
    if (!session) return undefined;
    const now = new Date().toISOString();
    let completedSteps = [...session.completedSteps];
    let skippedSteps = [...session.skippedSteps];

    if (action === 'complete') {
      if (!completedSteps.includes(stepIndex)) {
        completedSteps.push(stepIndex);
      }
      skippedSteps = skippedSteps.filter(s => s !== stepIndex);
    } else if (action === 'skip') {
      if (!skippedSteps.includes(stepIndex)) {
        skippedSteps.push(stepIndex);
      }
      completedSteps = completedSteps.filter(s => s !== stepIndex);
    } else if (action === 'uncomplete') {
      completedSteps = completedSteps.filter(s => s !== stepIndex);
    }

    const updated: PracticeSession = {
      ...session,
      currentStepIndex: stepIndex,
      completedSteps,
      skippedSteps,
      updatedAt: now,
    };
    set((state) => ({
      practiceSessions: state.practiceSessions.map(s => s.id === sessionId ? updated : s),
      currentSession: state.currentSession?.id === sessionId ? updated : state.currentSession,
    }));
    return updated;
  },

  markStepDifficulty: async (modelId, stepId, isDifficult, notes = '') => {
    const existing = get().stepDifficultyMarks.find(
      m => m.modelId === modelId && m.stepId === stepId
    );
    const now = new Date().toISOString();
    if (existing) {
      const updated: StepDifficultyMark = {
        ...existing,
        isDifficult,
        notes,
        updatedAt: now,
      };
      set((state) => ({
        stepDifficultyMarks: state.stepDifficultyMarks.map(m => m.id === existing.id ? updated : m),
      }));
      return updated;
    } else {
      const mark: StepDifficultyMark = {
        id: generateId(),
        modelId,
        stepId,
        isDifficult,
        notes,
        createdAt: now,
        updatedAt: now,
      };
      set((state) => ({
        stepDifficultyMarks: [...state.stepDifficultyMarks, mark],
      }));
      return mark;
    }
  },

  fetchStepDifficultyMarks: async (_modelId) => {
  },

  createCollection: async (data) => {
    const now = new Date().toISOString();
    const collection: Collection = {
      id: generateId(),
      name: data.name || '',
      description: data.description || '',
      coverImage: data.coverImage,
      modelIds: data.modelIds || [],
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({
      collections: [collection, ...state.collections],
    }));
    return collection;
  },

  updateCollection: async (id, data) => {
    const existing = get().collections.find(c => c.id === id);
    if (!existing) return undefined;
    const now = new Date().toISOString();
    const updated: Collection = {
      ...existing,
      ...data,
      updatedAt: now,
    };
    set((state) => ({
      collections: state.collections.map(c => c.id === id ? updated : c),
    }));
    return updated;
  },

  deleteCollection: async (id) => {
    set((state) => ({
      collections: state.collections.filter(c => c.id !== id),
    }));
    return true;
  },

  addModelToCollection: async (collectionId, modelId) => {
    const collection = get().collections.find(c => c.id === collectionId);
    const model = get().models.find(m => m.id === modelId);
    if (!collection || !model) return undefined;
    const now = new Date().toISOString();
    const newModelIds = collection.modelIds.includes(modelId)
      ? collection.modelIds
      : [...collection.modelIds, modelId];
    const updatedCollection: Collection = {
      ...collection,
      modelIds: newModelIds,
      updatedAt: now,
    };
    const updatedModel: Model = {
      ...model,
      collectionIds: model.collectionIds.includes(collectionId)
        ? model.collectionIds
        : [...model.collectionIds, collectionId],
      updatedAt: now,
    };
    set((state) => ({
      collections: state.collections.map(c => c.id === collectionId ? updatedCollection : c),
      models: state.models.map(m => m.id === modelId ? updatedModel : m),
    }));
    return updatedCollection;
  },

  removeModelFromCollection: async (collectionId, modelId) => {
    const collection = get().collections.find(c => c.id === collectionId);
    const model = get().models.find(m => m.id === modelId);
    if (!collection || !model) return undefined;
    const now = new Date().toISOString();
    const updatedCollection: Collection = {
      ...collection,
      modelIds: collection.modelIds.filter(id => id !== modelId),
      updatedAt: now,
    };
    const updatedModel: Model = {
      ...model,
      collectionIds: model.collectionIds.filter(id => id !== collectionId),
      updatedAt: now,
    };
    set((state) => ({
      collections: state.collections.map(c => c.id === collectionId ? updatedCollection : c),
      models: state.models.map(m => m.id === modelId ? updatedModel : m),
    }));
    return updatedCollection;
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
