import { Router } from 'express';
import TextGeneratorController from './controller';

const router = Router();

router.post('/generate-text', TextGeneratorController.generateText);

export default router;
