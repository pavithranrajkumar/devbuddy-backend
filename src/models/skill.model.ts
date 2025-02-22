import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.config';
import UserSkill from './userSkill.model';

interface SkillAttributes {
  id: number;
  name: string;
  category?: string;
}

interface SkillCreationAttributes extends Omit<SkillAttributes, 'id'> {}

class Skill extends Model<SkillAttributes, SkillCreationAttributes> implements SkillAttributes {
  public id!: number;
  public name!: string;
  public category!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  declare UserSkill?: UserSkill;
}

Skill.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'skills',
    timestamps: true,
    paranoid: true,
  }
);

export default Skill;
