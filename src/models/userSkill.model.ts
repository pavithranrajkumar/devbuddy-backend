import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.config";
import Skill from "./skill.model";

class UserSkill extends Model {
  public id!: number;
  public userId!: number;
  public skillId!: number;
  public proficiencyLevel!: "beginner" | "intermediate" | "expert";
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
    },
    skillId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    proficiencyLevel: {
      type: DataTypes.ENUM("beginner", "intermediate", "expert"),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "user_skills",
    timestamps: true,
    paranoid: true,
  }
);

// Define associations
UserSkill.belongsTo(Skill, { foreignKey: "skillId" });
Skill.hasMany(UserSkill, { foreignKey: "skillId" });

export default UserSkill;
