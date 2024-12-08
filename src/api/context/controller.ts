import { NextFunction, Request, Response } from 'express';
import { ContextService } from '../context/service';
import { JWTPayload } from '../../core/types';
import { ContextDto } from './context.dto';
import { GlobalValidator } from '../../core/utils/validators';

export default class ContextController {
  static contextService: ContextService = new ContextService();

  static async retrieveContext(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { userId } = req.user as JWTPayload;

      const context = await ContextController.contextService.getContext(userId);

      res.status(200).send({ context });
    } catch (error) {
      next(error);
    }
  }

  static async updateContext(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { userId } = req.user as JWTPayload;
      const { updates } = req.body;

      const validatedContext = await GlobalValidator.validateInput(
        ContextDto,
        updates,
      );

      await ContextController.contextService.updateContext(
        userId,
        validatedContext,
      );

      res.status(200).send('Context updated');
    } catch (error) {
      next(error);
    }
  }
}
