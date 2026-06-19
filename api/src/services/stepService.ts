import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database.js';
import { modelService } from './modelService.js';
import type { FoldStep, FoldType } from '../../../shared/types.js';

export const stepService = {
  getByModelId(modelId: string): FoldStep[] {
    return db.getSteps()
      .filter(s => s.modelId === modelId)
      .sort((a, b) => a.stepNumber - b.stepNumber);
  },
  
  getById(id: string): FoldStep | undefined {
    return db.getSteps().find(s => s.id === id);
  },
  
  create(modelId: string, data: Omit<FoldStep, 'id' | 'modelId' | 'createdAt' | 'updatedAt'>): FoldStep {
    const now = new Date().toISOString();
    const step: FoldStep = {
      ...data,
      id: uuidv4(),
      modelId,
      createdAt: now,
      updatedAt: now,
    };
    const steps = db.getSteps();
    steps.push(step);
    db.setSteps(steps);
    modelService.updateStepCount(modelId);
    return step;
  },
  
  update(id: string, data: Partial<FoldStep>): FoldStep | undefined {
    const steps = db.getSteps();
    const index = steps.findIndex(s => s.id === id);
    if (index === -1) return undefined;
    
    steps[index] = {
      ...steps[index],
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };
    db.setSteps(steps);
    
    if (steps[index].modelId) {
      modelService.updateStepCount(steps[index].modelId);
    }
    
    return steps[index];
  },
  
  delete(id: string): boolean {
    const step = db.getSteps().find(s => s.id === id);
    if (!step) return false;
    
    const steps = db.getSteps().filter(s => s.id !== id);
    db.setSteps(steps);
    modelService.updateStepCount(step.modelId);
    return true;
  },
  
  reorder(modelId: string, stepIds: string[]): boolean {
    const steps = db.getSteps();
    const modelSteps = steps.filter(s => s.modelId === modelId);
    
    if (modelSteps.length !== stepIds.length) {
      return false;
    }
    
    stepIds.forEach((id, index) => {
      const step = steps.find(s => s.id === id);
      if (step && step.modelId === modelId) {
        step.stepNumber = index + 1;
        step.updatedAt = new Date().toISOString();
      }
    });
    
    db.setSteps(steps);
    return true;
  },
};
