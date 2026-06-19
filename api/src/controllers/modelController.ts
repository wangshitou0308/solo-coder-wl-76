import type { Request, Response } from 'express';
import { modelService } from '../services/modelService.js';
import type { Category, Difficulty } from '../../../shared/types.js';

export const modelController = {
  async getAll(req: Request, res: Response) {
    try {
      const { category, difficulty, search } = req.query;
      const filters = {
        category: category as Category | undefined,
        difficulty: difficulty as Difficulty | undefined,
        search: search as string | undefined,
      };
      const models = modelService.getAll(filters);
      res.json(models);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get models' });
    }
  },
  
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const model = modelService.getById(id);
      if (!model) {
        res.status(404).json({ error: 'Model not found' });
        return;
      }
      res.json(model);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get model' });
    }
  },
  
  async create(req: Request, res: Response) {
    try {
      const model = modelService.create(req.body);
      res.status(201).json(model);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create model' });
    }
  },
  
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const model = modelService.update(id, req.body);
      if (!model) {
        res.status(404).json({ error: 'Model not found' });
        return;
      }
      res.json(model);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update model' });
    }
  },
  
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const success = modelService.delete(id);
      if (!success) {
        res.status(404).json({ error: 'Model not found' });
        return;
      }
      res.json({ message: 'Model deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete model' });
    }
  },
};
