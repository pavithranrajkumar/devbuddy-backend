import { Op } from 'sequelize';
import {
  FreelancerDashboardData,
  FreelancerProfileOverview,
  SkillStats,
  ApplicationStats,
  RecentApplication,
  MatchingProject,
} from '../types/dashboard.types';
import User from '../models/user.model';
import Project from '../models/project.model';
import ProjectApplication, { ProjectApplicationStatus } from '../models/projectApplication.model';
import Skill from '../models/skill.model';

class FreelancerDashboardService {
  static async getDashboardData(userId: number): Promise<FreelancerDashboardData> {
    const [profileOverview, skills, applicationStats, recentApplications, matchingProjects] = await Promise.all([
      this.getProfileOverview(userId),
      this.getSkillStats(userId),
      this.getApplicationStats(userId),
      this.getRecentApplications(userId),
      this.getMatchingProjects(userId),
    ]);

    return {
      profileOverview,
      skills,
      applicationStats,
      recentApplications,
      matchingProjects,
    };
  }

  private static async getProfileOverview(userId: number): Promise<FreelancerProfileOverview> {
    const user = await User.findByPk(userId, {
      include: [
        {
          model: ProjectApplication,
          as: 'ProjectApplications',
          required: false,
          include: [
            {
              model: Project,
              as: 'Project',
              attributes: ['status'],
            },
          ],
        },
        {
          model: Skill,
          as: 'skills',
          through: {
            as: 'UserSkill',
            attributes: ['proficiencyLevel'],
          },
        },
      ],
    });

    if (!user) throw new Error('User not found');

    // Calculate profile completeness
    const profileFields = {
      name: user.name,
      title: user.title,
      bio: user.bio,
      hourlyRate: user.hourlyRate,
      email: user.email,
    };
    const filledFields = Object.values(profileFields).filter((value) => !!value);
    const profileCompleteness = (filledFields.length / Object.keys(profileFields).length) * 100;

    return {
      name: user.name,
      title: user.title,
      rating: user.rating || 0,
      activeProjects: user.ProjectApplications?.filter((app) => app.status === ProjectApplicationStatus.ACCEPTED).length || 0,
      completedProjects: user.ProjectApplications?.filter((app) => app.status === ProjectApplicationStatus.ACCEPTED).length || 0,
      profileCompleteness,
    };
  }

  private static async getSkillStats(userId: number): Promise<SkillStats[]> {
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Skill,
          as: 'skills',
          through: {
            as: 'UserSkill',
            attributes: ['id', 'proficiencyLevel'],
          },
        },
      ],
    });

    if (!user) throw new Error('User not found');
    return user.skills.map((skill) => {
      return {
        name: skill.name,
        proficiencyLevel: skill.UserSkill?.getDataValue('proficiencyLevel') as 'expert' | 'intermediate' | 'beginner',
        category: skill.category,
      };
    });
  }

  private static async getApplicationStats(userId: number): Promise<ApplicationStats> {
    const applications = await ProjectApplication.findAll({
      where: { freelancerId: userId },
    });

    const totalApplications = applications.length;
    const statusBreakdown: Record<ProjectApplicationStatus, number> = {
      [ProjectApplicationStatus.APPLIED]: 0,
      [ProjectApplicationStatus.MARKED_FOR_INTERVIEW]: 0,
      [ProjectApplicationStatus.ACCEPTED]: 0,
      [ProjectApplicationStatus.REJECTED]: 0,
      [ProjectApplicationStatus.WITHDRAWN]: 0,
      [ProjectApplicationStatus.COMPLETED]: 0,
    };

    applications.forEach((app) => {
      statusBreakdown[app.status]++;
    });

    const activeApplications = statusBreakdown[ProjectApplicationStatus.APPLIED] + statusBreakdown[ProjectApplicationStatus.MARKED_FOR_INTERVIEW];
    const successRate = totalApplications > 0 ? (statusBreakdown[ProjectApplicationStatus.ACCEPTED] / totalApplications) * 100 : 0;

    return {
      totalApplications,
      activeApplications,
      successRate,
      statusBreakdown,
    };
  }

  private static async getRecentApplications(userId: number): Promise<RecentApplication[]> {
    const applications = await ProjectApplication.findAll({
      where: { freelancerId: userId },
      include: [
        {
          model: Project,
          as: 'Project',
          attributes: ['title'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    return applications.map((app) => ({
      projectTitle: app.Project?.title,
      status: app.status,
      appliedDate: app.createdAt,
      proposedRate: app.proposedRate,
    }));
  }

  private static async getMatchingProjects(userId: number): Promise<MatchingProject[]> {
    // Get user's skills
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Skill,
          as: 'skills',
          attributes: ['id'],
        },
      ],
    });

    if (!user) throw new Error('User not found');

    const userSkillIds = user.skills.map((skill) => skill.id);

    // Find matching projects
    const projects = await Project.findAll({
      include: [
        {
          model: Skill,
          as: 'skills',
          where: {
            id: {
              [Op.in]: userSkillIds,
            },
          },
        },
      ],
      where: {
        status: 'published',
        deadline: {
          [Op.gt]: new Date(),
        },
      },
      limit: 5,
    });

    return projects.map((project) => {
      const matchingSkillsCount = project.skills?.filter((skill) => userSkillIds.includes(skill.id)).length || 0;
      const matchScore = (matchingSkillsCount / (project.skills?.length || 1)) * 100;

      return {
        title: project.title,
        budgetRange: {
          min: project.budgetMin,
          max: project.budgetMax,
        },
        requiredSkills: project.skills?.map((skill) => skill.name) || [],
        postedDate: project.createdAt,
        matchScore,
      };
    });
  }
}

export default FreelancerDashboardService;
