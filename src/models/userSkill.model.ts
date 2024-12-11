import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.config';
import User from './user.model';
import Skill from './skill.model';

interface UserSkillAttributes {
  id: number;
  userId: number;
  skillId: number;
  proficiencyLevel: 'beginner' | 'intermediate' | 'expert';
}

interface UserSkillCreationAttributes extends Omit<UserSkillAttributes, 'id'> {}

class UserSkill extends Model<UserSkillAttributes, UserSkillCreationAttributes> implements UserSkillAttributes {
  public id!: number;
  public userId!: number;
  public skillId!: number;
  public proficiencyLevel!: 'beginner' | 'intermediate' | 'expert';
}

UserSkill.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
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
    proficiencyLevel: {
      type: DataTypes.ENUM('beginner', 'intermediate', 'expert'),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'user_skills',
    timestamps: true,
  }
);

// Associations
UserSkill.belongsTo(Skill, { foreignKey: 'skillId' });
UserSkill.belongsTo(User, { foreignKey: 'userId' });

export default UserSkill;
