import { UserSkillInput } from '../validations/profile/schemas';
import UserSkill from '../models/userSkill.model';
import Skill from '../models/skill.model';
import { NotFoundError, UnauthorizedError } from '../utils/errors';

class UserSkillService {
  public static async addUserSkill(userId: number, data: UserSkillInput) {
    if (!userId) throw new UnauthorizedError();

    const skill = await Skill.findByPk(data.skillId);
    if (!skill) throw new NotFoundError('Skill not found');

    return await UserSkill.create({
      userId,
      skillId: data.skillId,
      proficiencyLevel: data.proficiencyLevel,
    });
  }

  public static async getUserSkills(userId: number) {
    if (!userId) throw new UnauthorizedError();

    return await UserSkill.findAll({
      where: { userId },
      include: [
        {
          model: Skill,
          attributes: ['name', 'category'],
        },
      ],
      paranoid: true,
    });
  }

  public static async removeUserSkill(userId: number, id: number) {
    if (!userId) throw new UnauthorizedError();

    const userSkill = await UserSkill.findOne({
      where: { userId, id },
    });

    if (!userSkill) throw new NotFoundError('Skill not found for this user');

    await userSkill.destroy();
  }

  public static async updateUserSkill(userId: number, id: number, data: Pick<UserSkillInput, 'proficiencyLevel'>) {
    if (!userId) throw new UnauthorizedError();

    const userSkill = await UserSkill.findOne({
      where: { userId, id },
    });

    if (!userSkill) throw new NotFoundError('Skill not found for this user');

    return await userSkill.update({ proficiencyLevel: data.proficiencyLevel });
  }
}

export default UserSkillService;
