import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import ProjectService, {
  ProjectSortField,
  SortOrder,
} from "../services/project.service";

class ProjectController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const project = await ProjectService.createProject(
        req.user!.id,
        req.body
      );
      res.status(201).json(project);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const project = await ProjectService.updateProject(
        parseInt(req.params.id),
        req.user!.id,
        req.body
      );
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
      const {
        status,
        budgetMin,
        budgetMax,
        skills,
        search,
        createdAfter,
        createdBefore,
        hasDeadlineBefore,
        sortBy,
        sortOrder,
        page,
        limit,
      } = req.query;

      const projects = await ProjectService.getProjects(
        {
          clientId: req.user?.id,
          status: status as string,
          budgetMin: budgetMin ? Number(budgetMin) : undefined,
          budgetMax: budgetMax ? Number(budgetMax) : undefined,
          skills: skills ? String(skills).split(",").map(Number) : undefined,
          search: search as string,
          createdAfter: createdAfter
            ? new Date(String(createdAfter))
            : undefined,
          createdBefore: createdBefore
            ? new Date(String(createdBefore))
            : undefined,
          hasDeadlineBefore: hasDeadlineBefore
            ? new Date(String(hasDeadlineBefore))
            : undefined,
          sort: sortBy
            ? {
                field: sortBy as ProjectSortField,
                order: (sortOrder as SortOrder) || "desc",
              }
            : undefined,
        },
        Number(page),
        Number(limit)
      );

      res.json(projects);
    } catch (error) {
      next(error);
    }
  }

  static async getMatching(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const projects = await ProjectService.getMatchingProjects(
        req.user!.id,
        parseInt(page as string),
        parseInt(limit as string)
      );
      res.json(projects);
    } catch (error) {
      next(error);
    }
  }
}

export default ProjectController;
