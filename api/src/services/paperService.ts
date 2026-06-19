import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database.js';
import type { Paper, PaperType } from '../../../shared/types.js';

export const paperService = {
  getAll(): Paper[] {
    return db.getPaper().sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  },
  
  getById(id: string): Paper | undefined {
    return db.getPaper().find(p => p.id === id);
  },
  
  create(data: Omit<Paper, 'id' | 'createdAt' | 'updatedAt'>): Paper {
    const now = new Date().toISOString();
    const paper: Paper = {
      ...data,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    const papers = db.getPaper();
    papers.push(paper);
    db.setPaper(papers);
    return paper;
  },
  
  update(id: string, data: Partial<Paper>): Paper | undefined {
    const papers = db.getPaper();
    const index = papers.findIndex(p => p.id === id);
    if (index === -1) return undefined;
    
    papers[index] = {
      ...papers[index],
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };
    db.setPaper(papers);
    return papers[index];
  },
  
  delete(id: string): boolean {
    const papers = db.getPaper().filter(p => p.id !== id);
    db.setPaper(papers);
    return true;
  },
  
  adjustQuantity(id: string, amount: number): Paper | undefined {
    const papers = db.getPaper();
    const index = papers.findIndex(p => p.id === id);
    if (index === -1) return undefined;
    
    papers[index].quantity = Math.max(0, papers[index].quantity + amount);
    papers[index].updatedAt = new Date().toISOString();
    db.setPaper(papers);
    return papers[index];
  },
  
  getLowStock(): Paper[] {
    return db.getPaper().filter(p => p.quantity <= p.lowStockThreshold);
  },
};
