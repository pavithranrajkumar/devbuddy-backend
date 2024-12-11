import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import AuthService from '../services/auth.service';
import User from '../models/user.model';

class AuthController {
  public static async register(req: AuthRequest, res: Response) {
    try {
      const result = await AuthService.register(req.body);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async login(req: AuthRequest, res: Response) {
    try {
      const result = await AuthService.login(req.body);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async getProfile(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      res.status(200).json({
        id: user?.id,
        email: user?.email,
        name: user?.name,
        userType: user?.userType,
        title: user?.title,
        bio: user?.bio,
        hourlyRate: user?.hourlyRate,
        experienceInMonths: user?.experienceInMonths,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public static async me(req: AuthRequest, res: Response) {
    try {
      const user = await User.findByPk(req.user!.id, {
        attributes: ['id', 'email', 'name', 'userType', 'title', 'experienceInMonths'],
      });

      if (!user) {
        res.status(401).json({ message: 'User not found' });
        return;
      }

      res.json({ user });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export default AuthController;
