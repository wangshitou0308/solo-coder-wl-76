import { Router } from 'express';
import { paperController } from '../controllers/paperController.js';

const router = Router();

router.get('/', paperController.getAll);
router.get('/low-stock', paperController.getLowStock);
router.get('/:id', paperController.getById);
router.post('/', paperController.create);
router.put('/:id', paperController.update);
router.delete('/:id', paperController.delete);
router.post('/:id/adjust', paperController.adjustQuantity);

export default router;
