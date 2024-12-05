import { Request, Response } from 'express';
import UserService from './service';

class UserController {
  static async registerUser(req: Request, res: Response) {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).send('Username and password are required');
    }

    try {
      await UserService.registerUser(username, password);
      res.status(200).send('User registered successfully');
    } catch (error) {
      res.status(500).send('Error registering user');
    }
  }

  static async loginUser(req: Request, res: Response) {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).send('Username and password are required');
    }

    try {
      const token = await UserService.loginUser(username, password);
      res.send({ token });
    } catch (error) {
      res.status(401).send('Invalid credentials');
    }
  }
}

export default UserController;
