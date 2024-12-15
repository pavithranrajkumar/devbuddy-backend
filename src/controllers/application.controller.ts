import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import ApplicationService from '../services/application.service';
import { ProjectApplicationStatus } from '@/models/projectApplication.model';

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

  static async getApplications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status, page, limit, projectId } = req.query;
      // Only pass pagination params if they exist
      const paginationParams = page && limit ? { page: Number(page), limit: Number(limit) } : undefined;

      const applications = await ApplicationService.getApplications(
        req.user!.id,
        req.user!.userType,
        {
          status: status as ProjectApplicationStatus[],
          projectId: projectId ? parseInt(projectId as string) : undefined,
        },
        paginationParams
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
