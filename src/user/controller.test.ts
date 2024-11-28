import { Request, Response } from 'express';
import UserController from './controller';
import UserService from './service';

jest.mock('./service');

describe('UserController', () => {
  describe('registerUser', () => {
    it('should return 400 if username or password is missing', async () => {
      const req = { body: {} } as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Response;

      await UserController.registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith(
        'Username and password are required',
      );
    });

    it('should register user successfully', async () => {
      const req = {
        body: { username: 'test', password: 'password' },
      } as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Response;

      jest.spyOn(UserService, 'registerUser').mockResolvedValue();

      await UserController.registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith('User registered successfully');
    });
  });

  describe('loginUser', () => {
    it('should return 400 if username or password is missing', async () => {
      const req = { body: {} } as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Response;

      await UserController.loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith(
        'Username and password are required',
      );
    });

    it('should return token on successful login', async () => {
      const req = {
        body: { username: 'test', password: 'password' },
      } as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Response;

      jest.spyOn(UserService, 'loginUser').mockResolvedValue('token');

      await UserController.loginUser(req, res);

      expect(res.send).toHaveBeenCalledWith({ token: 'token' });
    });

    it('should return 401 on invalid credentials', async () => {
      const req = {
        body: { username: 'test', password: 'wrongpassword' },
      } as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Response;

      jest
        .spyOn(UserService, 'loginUser')
        .mockRejectedValue(new Error('Invalid credentials'));

      await UserController.loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith('Invalid credentials');
    });
  });
});
