import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import ApplicationService, { ApplicationStatus } from '../services/application.service';

class ApplicationController {
  static async apply(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const application = await ApplicationService.applyToProject(req.user!.id, parseInt(projectId), req.body);
      res.status(201).json(application);
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const application = await ApplicationService.updateApplicationStatus(parseInt(id), status, req.user!.id);
      res.json(application);
    } catch (error) {
      next(error);
    }
  }

  static async getProjectApplications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const { status } = req.query;
      const applications = await ApplicationService.getApplicationsForProject(parseInt(projectId), req.user!.id, {
        status: status as ApplicationStatus[],
      });
      res.json(applications);
    } catch (error) {
      next(error);
    }
  }

  static async getMyApplications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status, page, limit } = req.query;
      const applications = await ApplicationService.getMyApplications(
        req.user!.id,
        { status: status as ApplicationStatus[] },
        { page: Number(page), limit: Number(limit) }
      );
      res.json(applications);
    } catch (error) {
      next(error);
    }
  }

  static async withdraw(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const application = await ApplicationService.withdrawApplication(parseInt(id), req.user!.id);
      res.json(application);
    } catch (error) {
      next(error);
    }
  }
}

export default ApplicationController;
