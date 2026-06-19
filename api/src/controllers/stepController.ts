import type { Request, Response } from 'express';
import { stepService } from '../services/stepService.js';

export const stepController = {
  async getByModelId(req: Request, res: Response) {
    try {
      const { modelId } = req.params;
      const steps = stepService.getByModelId(modelId);
      res.json(steps);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get steps' });
    }
  },
  
  async create(req: Request, res: Response) {
    try {
      const { modelId } = req.params;
      const step = stepService.create(modelId, req.body);
      res.status(201).json(step);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create step' });
    }
  },
  
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const step = stepService.update(id, req.body);
      if (!step) {
        res.status(404).json({ error: 'Step not found' });
        return;
      }
      res.json(step);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update step' });
    }
  },
  
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const success = stepService.delete(id);
      if (!success) {
        res.status(404).json({ error: 'Step not found' });
        return;
      }
      res.json({ message: 'Step deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete step' });
    }
  },
  
  async reorder(req: Request, res: Response) {
    try {
      const { modelId } = req.params;
      const { stepIds } = req.body;
      const success = stepService.reorder(modelId, stepIds);
      if (!success) {
        res.status(400).json({ error: 'Failed to reorder steps' });
        return;
      }
      res.json({ message: 'Steps reordered successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to reorder steps' });
    }
  },
};
