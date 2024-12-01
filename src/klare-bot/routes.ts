import { Router } from 'express';
import KlareBotController from './controller';

const router = Router();

router.post('/sendMessage', KlareBotController.sendMessage);

export default router;
