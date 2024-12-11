import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { UserSkillInput } from '../validations/userSkill/schemas';
import UserSkillService from '../services/userSkill.service';

class UserSkillController {
  public static async addSkill(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: UserSkillInput = req.body;
      const userId = req.user?.id;
      const userSkill = await UserSkillService.addUserSkill(userId!, data);
      res.status(201).json(userSkill);
    } catch (error) {
      next(error);
    }
  }

  public static async getUserSkills(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const skills = await UserSkillService.getUserSkills(userId!);
      res.status(200).json(skills);
    } catch (error) {
      next(error);
    }
  }

  public static async updateSkill(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const { proficiencyLevel } = req.body;
      const userSkill = await UserSkillService.updateUserSkill(userId!, parseInt(id), { proficiencyLevel });
      res.status(200).json(userSkill);
    } catch (error) {
      next(error);
    }
  }

  public static async removeSkill(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      await UserSkillService.removeUserSkill(userId!, parseInt(id));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default UserSkillController;
