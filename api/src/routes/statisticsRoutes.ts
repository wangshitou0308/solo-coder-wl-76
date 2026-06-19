import { Router } from 'express';
import { statisticsController } from '../controllers/statisticsController.js';

const router = Router();

router.get('/summary', statisticsController.getSummary);
router.get('/models-by-category', statisticsController.getModelsByCategory);
router.get('/folds-by-month', statisticsController.getFoldsByMonth);
router.get('/top-models', statisticsController.getTopModels);
router.get('/folds-by-difficulty', statisticsController.getFoldsByDifficulty);
router.get('/top-paper', statisticsController.getTopPaper);

export default router;
