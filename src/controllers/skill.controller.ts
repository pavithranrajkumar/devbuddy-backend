import { Request, Response, NextFunction } from 'express';
import { SkillInput } from '../validations/profile/schemas';
import SkillService from '../services/skill.service';

class SkillController {
  public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: SkillInput = req.body;
      const skill = await SkillService.createSkill(data);
      res.status(201).json(skill);
    } catch (error) {
      next(error);
    }
  }

  public static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const skills = await SkillService.getAllSkills();
      res.status(200).json(skills);
    } catch (error) {
      next(error);
    }
  }

  public static async getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const skill = await SkillService.getSkillById(parseInt(id));
      res.status(200).json(skill);
    } catch (error) {
      next(error);
    }
  }

  public static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data: SkillInput = req.body;
      const skill = await SkillService.updateSkill(parseInt(id), data);
      res.status(200).json(skill);
    } catch (error) {
      next(error);
    }
  }

  public static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await SkillService.deleteSkill(parseInt(id));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default SkillController;
