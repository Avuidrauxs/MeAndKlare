import { Router } from 'express';
import ContextController from './controller';
import { authMiddleware } from '../../middleware/authMiddleware';

const router = Router();

router.get(
  '/retrieveContext',
  authMiddleware,
  ContextController.retrieveContext,
);
router.put('/updateContext', authMiddleware, ContextController.updateContext);

export default router;
