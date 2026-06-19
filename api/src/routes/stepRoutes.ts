import { Router } from 'express';
import { stepController } from '../controllers/stepController.js';

const router = Router({ mergeParams: true });

router.get('/', stepController.getByModelId);
router.post('/', stepController.create);
router.put('/reorder', stepController.reorder);
router.put('/:id', stepController.update);
router.delete('/:id', stepController.delete);

export default router;
