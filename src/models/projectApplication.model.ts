import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.config';
import Project from './project.model';
import User from './user.model';

export enum ProjectApplicationStatus {
  APPLIED = 'applied',
  MARKED_FOR_INTERVIEW = 'marked_for_interview',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
  COMPLETED = 'completed',
}

interface ProjectApplicationAttributes {
  id?: number;
  projectId: number;
  freelancerId: number;
  coverLetter: string;
  proposedRate: number;
  estimatedDuration: number;
  status: ProjectApplicationStatus;
  clientNotes?: string;
  rejectionReason?: string;
  withdrawalReason?: string;
  clientRating?: number;
  clientReview?: string;
  freelancerRating?: number;
  freelancerReview?: string;
  ratingSubmittedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  Project?: Project;
}

class ProjectApplication extends Model<ProjectApplicationAttributes> implements ProjectApplicationAttributes {
  public id!: number;
  public projectId!: number;
  public freelancerId!: number;
  public coverLetter!: string;
  public proposedRate!: number;
  public estimatedDuration!: number;
  public status!: ProjectApplicationStatus;
  public clientNotes?: string;
  public rejectionReason?: string;
  public withdrawalReason?: string;
  public clientRating?: number;
  public clientReview?: string;
  public freelancerRating?: number;
  public freelancerReview?: string;
  public ratingSubmittedAt?: Date;
  public createdAt!: Date;
  public updatedAt!: Date;
  public Project!: Project;
}

ProjectApplication.init(
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
    freelancerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    coverLetter: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [100, 1000],
      },
    },
    proposedRate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    estimatedDuration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    status: {
      type: DataTypes.ENUM('applied', 'marked_for_interview', 'accepted', 'rejected', 'withdrawn'),
      allowNull: false,
      defaultValue: 'applied',
    },
    clientNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 500],
      },
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [100, 500],
      },
    },
    withdrawalReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [100, 500],
      },
    },
    clientRating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5,
      },
    },
    clientReview: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [100, 500],
      },
    },
    freelancerRating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5,
      },
    },
    freelancerReview: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [100, 500],
      },
    },
    ratingSubmittedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'project_applications',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['projectId', 'freelancerId'],
        name: 'unique_project_freelancer',
      },
    ],
    paranoid: true,
  }
);

export default ProjectApplication;
