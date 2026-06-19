import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database.js';
import { paperService } from './paperService.js';
import type { FoldRecord } from '../../../shared/types.js';

export const foldService = {
  getAll(): FoldRecord[] {
    return db.getFolds().sort((a, b) => 
      new Date(b.foldDate).getTime() - new Date(a.foldDate).getTime()
    );
  },
  
  getByModelId(modelId: string): FoldRecord[] {
    return db.getFolds()
      .filter(f => f.modelId === modelId)
      .sort((a, b) => new Date(b.foldDate).getTime() - new Date(a.foldDate).getTime());
  },
  
  getById(id: string): FoldRecord | undefined {
    return db.getFolds().find(f => f.id === id);
  },
  
  create(data: Omit<FoldRecord, 'id' | 'createdAt'>): FoldRecord {
    const now = new Date().toISOString();
    const record: FoldRecord = {
      ...data,
      id: uuidv4(),
      createdAt: now,
    };
    const folds = db.getFolds();
    folds.push(record);
    db.setFolds(folds);
    
    if (data.paperId) {
      paperService.adjustQuantity(data.paperId, -1);
    }
    
    return record;
  },
  
  update(id: string, data: Partial<FoldRecord>): FoldRecord | undefined {
    const folds = db.getFolds();
    const index = folds.findIndex(f => f.id === id);
    if (index === -1) return undefined;
    
    folds[index] = {
      ...folds[index],
      ...data,
      id,
    };
    db.setFolds(folds);
    return folds[index];
  },
  
  delete(id: string): boolean {
    const fold = db.getFolds().find(f => f.id === id);
    if (!fold) return false;
    
    const folds = db.getFolds().filter(f => f.id !== id);
    db.setFolds(folds);
    
    if (fold.paperId) {
      paperService.adjustQuantity(fold.paperId, 1);
    }
    
    return true;
  },
};
