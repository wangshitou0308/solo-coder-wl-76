import type { Request, Response } from 'express';
import { statisticsService } from '../services/statisticsService.js';

export const statisticsController = {
  async getSummary(req: Request, res: Response) {
    try {
      const summary = statisticsService.getSummary();
      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get statistics summary' });
    }
  },
  
  async getModelsByCategory(req: Request, res: Response) {
    try {
      const data = statisticsService.getModelsByCategory();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get category statistics' });
    }
  },
  
  async getFoldsByMonth(req: Request, res: Response) {
    try {
      const data = statisticsService.getFoldsByMonth();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get monthly fold statistics' });
    }
  },
  
  async getTopModels(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const data = statisticsService.getTopModels(limit);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get top models' });
    }
  },
  
  async getFoldsByDifficulty(req: Request, res: Response) {
    try {
      const data = statisticsService.getFoldsByDifficulty();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get difficulty statistics' });
    }
  },
  
  async getTopPaper(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const data = statisticsService.getTopPaper(limit);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get top paper' });
    }
  },
};
