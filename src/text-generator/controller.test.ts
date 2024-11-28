import { Request, Response } from 'express';
import TextGeneratorController from './controller';
import TextGeneratorService from './service';

jest.mock('./service');

describe('TextGeneratorController', () => {
  describe('generateText', () => {
    it('should return 400 if prompt is missing', async () => {
      const req = { body: {} } as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Response;

      await TextGeneratorController.generateText(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith('Prompt is required');
    });

    it('should return generated text', async () => {
      const req = { body: { prompt: 'Hello, world!' } } as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Response;

      jest
        .spyOn(TextGeneratorService, 'generateText')
        .mockResolvedValue('Generated text');

      await TextGeneratorController.generateText(req, res);

      expect(res.send).toHaveBeenCalledWith('Generated text');
    });

    it('should return 500 if service throws an error', async () => {
      const req = { body: { prompt: 'Hello, world!' } } as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Response;

      jest
        .spyOn(TextGeneratorService, 'generateText')
        .mockRejectedValue(new Error('Service error'));

      await TextGeneratorController.generateText(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Error generating text');
    });
  });
});
