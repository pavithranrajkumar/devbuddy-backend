import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.config';

interface UserAttributes {
  id: number;
  email: string;
  password: string;
  userType: 'client' | 'freelancer' | 'admin';
  name: string;
  title?: string;
  bio?: string;
  hourlyRate?: number;
  linkedinUrl?: string;
  githubUrl?: string;
  experienceInMonths?: number;
}

interface UserCreationAttributes extends Omit<UserAttributes, 'id'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public email!: string;
  public password!: string;
  public userType!: 'client' | 'freelancer' | 'admin';
  public name!: string;
  public title!: string;
  public bio!: string;
  public hourlyRate!: number;
  public linkedinUrl!: string;
  public githubUrl!: string;
  public experienceInMonths!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
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
      type: DataTypes.ENUM('client', 'freelancer'),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
    },
    bio: {
      type: DataTypes.TEXT,
    },
    hourlyRate: {
      type: DataTypes.DECIMAL(10, 2),
    },
    linkedinUrl: {
      type: DataTypes.STRING,
      validate: {
        isUrl: true,
      },
    },
    githubUrl: {
      type: DataTypes.STRING,
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
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
  }
);

export default User;
