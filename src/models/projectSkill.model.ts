import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.config';
import Project from './project.model';
import Skill from './skill.model';

interface ProjectSkillAttributes {
  id: number;
  projectId: number;
  skillId: number;
}

class ProjectSkill extends Model<ProjectSkillAttributes> implements ProjectSkillAttributes {
  public id!: number;
  public projectId!: number;
  public skillId!: number;
}

ProjectSkill.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Project,
        key: 'id',
      },
    },
    skillId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Skill,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'project_skills',
    timestamps: true,
  }
);

export default ProjectSkill;
