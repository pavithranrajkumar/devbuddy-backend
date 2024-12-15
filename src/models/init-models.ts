import User from './user.model';
import Project from './project.model';
import ProjectApplication from './projectApplication.model';
import Skill from './skill.model';
import UserSkill from './userSkill.model';
import ProjectSkill from './projectSkill.model';

export function initializeModels() {
  // User associations
  User.hasMany(ProjectApplication, {
    foreignKey: 'freelancerId',
    as: 'ProjectApplications',
  });

  User.hasMany(Project, {
    foreignKey: 'clientId',
    as: 'ClientProjects',
  });

  // Project associations
  Project.belongsTo(User, {
    foreignKey: 'clientId',
    as: 'client',
  });

  Project.hasMany(ProjectApplication, {
    foreignKey: 'projectId',
    as: 'ProjectApplications',
  });

  Project.belongsToMany(Skill, {
    through: {
      model: ProjectSkill,
      unique: false,
    },
    foreignKey: 'projectId',
    otherKey: 'skillId',
    as: 'skills',
  });

  // User-Skill associations
  User.belongsToMany(Skill, {
    through: {
      model: UserSkill,
      unique: false,
    },
    foreignKey: 'userId',
    otherKey: 'skillId',
    as: 'skills',
  });

  Skill.belongsToMany(User, {
    through: {
      model: UserSkill,
      unique: false,
    },
    foreignKey: 'skillId',
    otherKey: 'userId',
    as: 'users',
  });

  // ProjectApplication associations
  ProjectApplication.belongsTo(Project, {
    foreignKey: 'projectId',
    as: 'Project',
  });

  ProjectApplication.belongsTo(User, {
    foreignKey: 'freelancerId',
    as: 'freelancer',
  });

  return {
    User,
    Project,
    ProjectApplication,
    Skill,
  };
}
