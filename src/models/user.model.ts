import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.config";
import Skill from "./skill.model";
import UserSkill from "./userSkill.model";
import ProjectApplication from "./projectApplication.model";

export enum UserType {
  CLIENT = "client",
  FREELANCER = "freelancer",
  ADMIN = "admin",
}

interface UserAttributes {
  id?: number;
  email: string;
  password: string;
  userType: UserType;
  name: string;
  title?: string;
  bio?: string;
  hourlyRate?: number;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  experienceInMonths?: number;
  activeProjectsCount?: number;
  completedProjectsCount?: number;
  rating?: number;
  skills?: Skill[];
}

class User extends Model<UserAttributes> implements UserAttributes {
  public id!: number;
  public email!: string;
  public password!: string;
  public userType!: UserType;
  public name!: string;
  public title!: string;
  public bio!: string;
  public hourlyRate!: number;
  public linkedinUrl!: string | null;
  public githubUrl!: string | null;
  public experienceInMonths!: number;
  public activeProjectsCount!: number;
  public completedProjectsCount!: number;
  public rating?: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public skills!: Skill[];
  declare ProjectApplications?: ProjectApplication[];
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userType: {
      type: DataTypes.ENUM(...Object.values(UserType)),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    hourlyRate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    linkedinUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },
    githubUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },
    experienceInMonths: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 600, // 50 years max
      },
    },
    activeProjectsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    completedProjectsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
      validate: {
        min: 0,
        max: 5,
      },
    },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: true,
    paranoid: true,
  }
);

export default User;
