import { Router } from 'express';
import { foldController } from '../controllers/foldController.js';

const router = Router();

router.get('/', foldController.getAll);
router.get('/:id', foldController.getById);
router.post('/', foldController.create);
router.put('/:id', foldController.update);
router.delete('/:id', foldController.delete);

export default router;
