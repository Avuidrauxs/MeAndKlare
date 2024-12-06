import { NextFunction, Request, Response } from 'express';
import UserService from './service';
import { UserDto } from './user.dto';
import { GlobalValidator } from '../../utils/validators';
import { ValidationError } from '../../core/errors';

class UserController {
  static async registerUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userDto = await GlobalValidator.validateInput(UserDto, req.body);
      const { username, password } = userDto;

      await UserService.registerUser(username, password);
      res.status(200).send('User registered successfully');
    } catch (error) {
      next(error);
    }
  }

  static async loginUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userDto = await GlobalValidator.validateInput(UserDto, req.body);
      const { username, password } = userDto;

      const token = await UserService.loginUser(username, password);
      res.send({ token });
    } catch (error) {
      if (error instanceof ValidationError) {
        next(error);
      } else {
        res.status(401).send('Invalid credentials');
      }
    }
  }
}

export default UserController;
