import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.config';
import User, { UserType } from './user.model';
import Skill from './skill.model';

interface ProjectAttributes {
  id?: number;
  title: string;
  description: string;
  clientId: number;
  budgetMin: number;
  budgetMax: number;
  deadline: Date;
  status: 'draft' | 'published' | 'in_progress' | 'completed' | 'cancelled';
  applicantsCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

class Project extends Model<ProjectAttributes> implements ProjectAttributes {
  public id!: number;
  public title!: string;
  public description!: string;
  public clientId!: number;
  public budgetMin!: number;
  public budgetMax!: number;
  public deadline!: Date;
  public status!: 'draft' | 'published' | 'in_progress' | 'completed' | 'cancelled';
  public applicantsCount!: number;
  public createdAt!: Date;
  public updatedAt!: Date;

  public getSkills!: () => Promise<Skill[]>;
  public setSkills!: (skills: number[]) => Promise<void>;
  public addSkill!: (skillId: number) => Promise<void>;
  public removeSkill!: (skillId: number) => Promise<void>;
}

Project.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [5, 100],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [50, 5000],
      },
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    budgetMin: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    budgetMax: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isAfterNow(value: Date) {
          if (value <= new Date()) {
            throw new Error('Deadline must be in the future');
          }
        },
      },
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'in_progress', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'draft',
    },
    applicantsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: 'projects',
    timestamps: true,
  }
);

// Associations
Project.belongsTo(User, { as: UserType.CLIENT, foreignKey: 'clientId' });
Project.belongsToMany(Skill, {
  through: 'project_skills',
  as: 'skills',
  foreignKey: 'projectId',
  otherKey: 'skillId',
});

export default Project;
