import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import FreelancerDashboardService from '../services/freelancer-dashboard.service';
import ClientDashboardService from '../services/client-dashboard.service';
import { UserType } from '../models/user.model';

class DashboardController {
  static async getFreelancerDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const dashboardData = await FreelancerDashboardService.getDashboardData(req.user!.id);
      res.json(dashboardData);
    } catch (error) {
      next(error);
    }
  }

  static async getClientDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const dashboardData = await ClientDashboardService.getDashboardData(req.user!.id);
      res.json(dashboardData);
    } catch (error) {
      next(error);
    }
  }
}

export default DashboardController;
