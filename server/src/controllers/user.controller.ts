import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { sendSuccess } from '../utils/response';

const userService = new UserService();

export class UserController {
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const user = await userService.getProfile(userId);
      sendSuccess(res, user, 'Profile retrieved');
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const user = await userService.updateProfile(userId, req.body);
      sendSuccess(res, user, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  }
}
