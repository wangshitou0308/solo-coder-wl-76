import type { Request, Response } from 'express';
import { paperService } from '../services/paperService.js';

export const paperController = {
  async getAll(req: Request, res: Response) {
    try {
      const paper = paperService.getAll();
      res.json(paper);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get paper inventory' });
    }
  },
  
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const paper = paperService.getById(id);
      if (!paper) {
        res.status(404).json({ error: 'Paper not found' });
        return;
      }
      res.json(paper);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get paper' });
    }
  },
  
  async create(req: Request, res: Response) {
    try {
      const paper = paperService.create(req.body);
      res.status(201).json(paper);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create paper' });
    }
  },
  
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const paper = paperService.update(id, req.body);
      if (!paper) {
        res.status(404).json({ error: 'Paper not found' });
        return;
      }
      res.json(paper);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update paper' });
    }
  },
  
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const success = paperService.delete(id);
      if (!success) {
        res.status(404).json({ error: 'Paper not found' });
        return;
      }
      res.json({ message: 'Paper deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete paper' });
    }
  },
  
  async adjustQuantity(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { amount } = req.body;
      const paper = paperService.adjustQuantity(id, amount);
      if (!paper) {
        res.status(404).json({ error: 'Paper not found' });
        return;
      }
      res.json(paper);
    } catch (error) {
      res.status(500).json({ error: 'Failed to adjust quantity' });
    }
  },
  
  async getLowStock(req: Request, res: Response) {
    try {
      const lowStock = paperService.getLowStock();
      res.json(lowStock);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get low stock paper' });
    }
  },
};
