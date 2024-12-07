import { Router } from 'express';
import KlareChatBotController from './controller';
import { authMiddleware } from '../../middleware/authMiddleware';

const router = Router();

router.post('/sendMessage', authMiddleware, KlareChatBotController.sendMessage);
router.post(
  '/initiateCheckIn',
  authMiddleware,
  KlareChatBotController.initiateCheckIn,
);

export default router;
