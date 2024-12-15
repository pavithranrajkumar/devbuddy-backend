import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import ProjectService, { ProjectSortField, SortOrder } from '../services/project.service';
import { UserType } from '../models/user.model';

class ProjectController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const project = await ProjectService.createProject(req.user!.id, req.body);
      res.status(201).json(project);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const project = await ProjectService.updateProject(parseInt(req.params.id), req.user!.id, req.body);
      res.json(project);
    } catch (error) {
      next(error);
    }
  }

  static async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await ProjectService.getProject(parseInt(req.params.id));
      res.json(project);
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Log the entire request query for debugging
      console.log('Request Query Parameters:', req.query);

      const { status, budgetMin, budgetMax, skills, search, createdAfter, createdBefore, hasDeadlineBefore } = req.query;

      // Log the received filters for debugging
      console.log('Received filters:', {
        status,
        budgetMin,
        budgetMax,
        skills,
        search,
        createdAfter,
        createdBefore,
        hasDeadlineBefore,
      });

      const projects = await ProjectService.getProjects(
        {
          status: status ? (status as string) : undefined,
          budgetMin: budgetMin ? Number(budgetMin) : undefined,
          budgetMax: budgetMax ? Number(budgetMax) : undefined,
          skills: skills ? String(skills).split(',').map(Number) : undefined,
          search: search as string,
          createdAfter: createdAfter ? new Date(String(createdAfter)) : undefined,
          createdBefore: createdBefore ? new Date(String(createdBefore)) : undefined,
          hasDeadlineBefore: hasDeadlineBefore ? new Date(String(hasDeadlineBefore)) : undefined,
          clientId: req.user?.id,
        },
        req.user?.userType,
        req.user?.id
      );

      res.json(projects);
    } catch (error) {
      next(error);
    }
  }

  static async getMatching(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status, budgetMin, budgetMax, search, createdAfter, createdBefore, hasDeadlineBefore } = req.query;
      console.log(req.query);
      const projects = await ProjectService.getMatchingProjects(req.user!.id, {
        status: status ? (status as string) : undefined,
        budgetMin: budgetMin ? Number(budgetMin) : undefined,
        budgetMax: budgetMax ? Number(budgetMax) : undefined,
        search: search as string,
        createdAfter: createdAfter ? new Date(String(createdAfter)) : undefined,
        createdBefore: createdBefore ? new Date(String(createdBefore)) : undefined,
        hasDeadlineBefore: hasDeadlineBefore ? new Date(String(hasDeadlineBefore)) : undefined,
      });
      res.json(projects);
    } catch (error) {
      next(error);
    }
  }
}

export default ProjectController;
