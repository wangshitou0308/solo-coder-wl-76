import { Router } from 'express';
import { modelController } from '../controllers/modelController.js';

const router = Router();

router.get('/', modelController.getAll);
router.get('/:id', modelController.getById);
router.post('/', modelController.create);
router.put('/:id', modelController.update);
router.delete('/:id', modelController.delete);

export default router;
