import axios from 'axios';
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

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const modelApi = {
  getAll: (params?: { category?: Category; difficulty?: Difficulty; search?: string }) =>
    api.get<Model[]>('/models', { params }).then(res => res.data),
  getById: (id: string) =>
    api.get<Model>(`/models/${id}`).then(res => res.data),
  create: (data: Partial<Model>) =>
    api.post<Model>('/models', data).then(res => res.data),
  update: (id: string, data: Partial<Model>) =>
    api.put<Model>(`/models/${id}`, data).then(res => res.data),
  delete: (id: string) =>
    api.delete(`/models/${id}`).then(res => res.data),
};

export const stepApi = {
  getByModelId: (modelId: string) =>
    api.get<FoldStep[]>(`/models/${modelId}/steps`).then(res => res.data),
  create: (modelId: string, data: Partial<FoldStep>) =>
    api.post<FoldStep>(`/models/${modelId}/steps`, data).then(res => res.data),
  update: (id: string, data: Partial<FoldStep>) =>
    api.put<FoldStep>(`/steps/${id}`, data).then(res => res.data),
  delete: (id: string) =>
    api.delete(`/steps/${id}`).then(res => res.data),
  reorder: (modelId: string, stepIds: string[]) =>
    api.put(`/models/${modelId}/steps/reorder`, { stepIds }).then(res => res.data),
};

export const foldApi = {
  getAll: () =>
    api.get<FoldRecord[]>('/folds').then(res => res.data),
  getByModelId: (modelId: string) =>
    api.get<FoldRecord[]>(`/models/${modelId}/folds`).then(res => res.data),
  create: (data: Partial<FoldRecord>) =>
    api.post<FoldRecord>('/folds', data).then(res => res.data),
  update: (id: string, data: Partial<FoldRecord>) =>
    api.put<FoldRecord>(`/folds/${id}`, data).then(res => res.data),
  delete: (id: string) =>
    api.delete(`/folds/${id}`).then(res => res.data),
};

export const paperApi = {
  getAll: () =>
    api.get<Paper[]>('/paper').then(res => res.data),
  getById: (id: string) =>
    api.get<Paper>(`/paper/${id}`).then(res => res.data),
  create: (data: Partial<Paper>) =>
    api.post<Paper>('/paper', data).then(res => res.data),
  update: (id: string, data: Partial<Paper>) =>
    api.put<Paper>(`/paper/${id}`, data).then(res => res.data),
  delete: (id: string) =>
    api.delete(`/paper/${id}`).then(res => res.data),
  adjustQuantity: (id: string, amount: number) =>
    api.post<Paper>(`/paper/${id}/adjust`, { amount }).then(res => res.data),
  getLowStock: () =>
    api.get<Paper[]>('/paper/low-stock').then(res => res.data),
};

export const statisticsApi = {
  getSummary: () =>
    api.get<StatisticsSummary>('/statistics/summary').then(res => res.data),
  getModelsByCategory: () =>
    api.get<CategoryCount[]>('/statistics/models-by-category').then(res => res.data),
  getFoldsByMonth: () =>
    api.get<MonthlyFold[]>('/statistics/folds-by-month').then(res => res.data),
  getTopModels: (limit?: number) =>
    api.get<TopModel[]>('/statistics/top-models', { params: { limit } }).then(res => res.data),
  getFoldsByDifficulty: () =>
    api.get<DifficultyCount[]>('/statistics/folds-by-difficulty').then(res => res.data),
  getTopPaper: (limit?: number) =>
    api.get<TopPaper[]>('/statistics/top-paper', { params: { limit } }).then(res => res.data),
};

export const uploadApi = {
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post<{ imageUrl: string }>('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(res => res.data);
  },
};
