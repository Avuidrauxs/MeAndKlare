import { Router } from 'express';
import KlareBotController from './controller';

const router = Router();

router.post('/sendMessage', KlareBotController.sendMessage);
router.post('/initiateCheckIn', KlareBotController.sendMessage);
router.get('/retrieveContext', KlareBotController.sendMessage);
router.put('/updateContext', KlareBotController.sendMessage);

export default router;
