import { Request, Response, NextFunction } from 'express';
import { ExperienceInput } from '../validations/profile/schemas';
import ExperienceService from '../services/experience.service';

class ExperienceController {
  public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: ExperienceInput = req.body;
      const userId = req.user?.id;

      const experience = await ExperienceService.create(userId!, data);
      res.status(201).json(experience);
    } catch (error) {
      next(error);
    }
  }

  public static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const experiences = await ExperienceService.getAll(userId!);
      res.status(200).json(experiences);
    } catch (error) {
      next(error);
    }
  }

  public static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data: ExperienceInput = req.body;
      const userId = req.user?.id;

      const experience = await ExperienceService.update(userId!, parseInt(id), data);
      res.status(200).json(experience);
    } catch (error) {
      next(error);
    }
  }

  public static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      await ExperienceService.delete(userId!, parseInt(id));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  public static async getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const experience = await ExperienceService.getOne(userId!, parseInt(id));
      res.status(200).json(experience);
    } catch (error) {
      next(error);
    }
  }
}

export default ExperienceController;
