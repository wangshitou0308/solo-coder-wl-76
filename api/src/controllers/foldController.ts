import type { Request, Response } from 'express';
import { foldService } from '../services/foldService.js';

export const foldController = {
  async getAll(req: Request, res: Response) {
    try {
      const folds = foldService.getAll();
      res.json(folds);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get fold records' });
    }
  },
  
  async getByModelId(req: Request, res: Response) {
    try {
      const { modelId } = req.params;
      const folds = foldService.getByModelId(modelId);
      res.json(folds);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get fold records' });
    }
  },
  
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const fold = foldService.getById(id);
      if (!fold) {
        res.status(404).json({ error: 'Fold record not found' });
        return;
      }
      res.json(fold);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get fold record' });
    }
  },
  
  async create(req: Request, res: Response) {
    try {
      const fold = foldService.create(req.body);
      res.status(201).json(fold);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create fold record' });
    }
  },
  
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const fold = foldService.update(id, req.body);
      if (!fold) {
        res.status(404).json({ error: 'Fold record not found' });
        return;
      }
      res.json(fold);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update fold record' });
    }
  },
  
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const success = foldService.delete(id);
      if (!success) {
        res.status(404).json({ error: 'Fold record not found' });
        return;
      }
      res.json({ message: 'Fold record deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete fold record' });
    }
  },
};
