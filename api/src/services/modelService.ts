import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database.js';
import type { Model, Category, Difficulty } from '../../../shared/types.js';

export const modelService = {
  getAll(filters?: { category?: Category; difficulty?: Difficulty; search?: string }): Model[] {
    let models = db.getModels();
    
    if (filters?.category) {
      models = models.filter(m => m.category === filters.category);
    }
    if (filters?.difficulty) {
      models = models.filter(m => m.difficulty === filters.difficulty);
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      models = models.filter(m => 
        m.name.toLowerCase().includes(search) ||
        m.designer.toLowerCase().includes(search) ||
        m.description.toLowerCase().includes(search)
      );
    }
    
    return models.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  },
  
  getById(id: string): Model | undefined {
    return db.getModels().find(m => m.id === id);
  },
  
  create(data: Omit<Model, 'id' | 'createdAt' | 'updatedAt' | 'stepCount'> & { stepCount?: number }): Model {
    const steps = db.getSteps().filter(s => s.modelId);
    const now = new Date().toISOString();
    const model: Model = {
      ...data,
      id: uuidv4(),
      stepCount: data.stepCount || 0,
      createdAt: now,
      updatedAt: now,
    };
    const models = db.getModels();
    models.push(model);
    db.setModels(models);
    return model;
  },
  
  update(id: string, data: Partial<Model>): Model | undefined {
    const models = db.getModels();
    const index = models.findIndex(m => m.id === id);
    if (index === -1) return undefined;
    
    models[index] = {
      ...models[index],
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };
    db.setModels(models);
    return models[index];
  },
  
  delete(id: string): boolean {
    const models = db.getModels().filter(m => m.id !== id);
    const steps = db.getSteps().filter(s => s.modelId !== id);
    const folds = db.getFolds().filter(f => f.modelId !== id);
    
    db.setModels(models);
    db.setSteps(steps);
    db.setFolds(folds);
    return true;
  },
  
  updateStepCount(modelId: string): void {
    const steps = db.getSteps().filter(s => s.modelId === modelId);
    const models = db.getModels();
    const index = models.findIndex(m => m.id === modelId);
    if (index !== -1) {
      models[index].stepCount = steps.length;
      models[index].updatedAt = new Date().toISOString();
      db.setModels(models);
    }
  },
};
