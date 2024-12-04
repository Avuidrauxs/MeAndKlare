import { Router } from 'express';
import KlareBotController from './controller';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/sendMessage', authMiddleware, KlareBotController.sendMessage);
router.post(
  '/initiateCheckIn',
  authMiddleware,
  KlareBotController.initiateCheckIn,
);
router.get(
  '/retrieveContext',
  authMiddleware,
  KlareBotController.retrieveContext,
);
router.put('/updateContext', authMiddleware, KlareBotController.updateContext);

export default router;
