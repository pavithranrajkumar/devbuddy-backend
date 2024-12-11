import { SkillInput } from '../validations/profile/schemas';
import Skill from '../models/skill.model';
import { NotFoundError } from '../utils/errors';

class SkillService {
  public static async createSkill(data: SkillInput) {
    return await Skill.create(data);
  }

  public static async getAllSkills() {
    return await Skill.findAll({
      order: [['name', 'ASC']],
    });
  }

  public static async getSkillById(id: number) {
    const skill = await Skill.findByPk(id);
    if (!skill) throw new NotFoundError('Skill not found');
    return skill;
  }

  public static async updateSkill(id: number, data: SkillInput) {
    const skill = await this.getSkillById(id);
    return await skill.update(data);
  }

  public static async deleteSkill(id: number) {
    const skill = await this.getSkillById(id);
    await skill.destroy();
  }
}

export default SkillService;
