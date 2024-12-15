import { Op } from 'sequelize';
import { ClientDashboardData, ProjectsOverview, RecentProject, ClientApplicationStats, ProjectTimeline } from '../types/dashboard.types';
import Project, { ProjectStatus } from '../models/project.model';
import ProjectApplication from '../models/projectApplication.model';
import User from '../models/user.model';
import Skill from '../models/skill.model';

class ClientDashboardService {
  static async getDashboardData(userId: number): Promise<ClientDashboardData> {
    const [projectsOverview, recentProjects, applicationStats, projectTimelines] = await Promise.all([
      this.getProjectsOverview(userId),
      this.getRecentProjects(userId),
      this.getApplicationStats(userId),
      this.getProjectTimelines(userId),
    ]);

    return {
      projectsOverview,
      recentProjects,
      applicationStats,
      projectTimelines,
    };
  }

  private static async getProjectsOverview(userId: number): Promise<ProjectsOverview> {
    const projects = await Project.findAll({
      where: { clientId: userId },
      attributes: ['status', 'budgetMin', 'budgetMax'],
    });

    const projectsByStatus = Object.values(ProjectStatus).reduce((acc, status) => {
      acc[status] = 0;
      return acc;
    }, {} as Record<ProjectStatus, number>);

    let totalBudget = 0;

    projects.forEach((project) => {
      projectsByStatus[project.status]++;
      totalBudget += project.budgetMax; // Using max budget for total calculation
    });

    return {
      activeProjects: projectsByStatus[ProjectStatus.PUBLISHED] + projectsByStatus[ProjectStatus.IN_PROGRESS],
      totalProjects: projects.length,
      totalBudget,
      projectsByStatus,
    };
  }

  private static async getRecentProjects(userId: number): Promise<RecentProject[]> {
    const projects = await Project.findAll({
      where: { clientId: userId },
      include: [
        {
          model: ProjectApplication,
          attributes: ['id'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    return projects.map((project) => ({
      title: project.title,
      status: project.status,
      applicantsCount: project.ProjectApplications?.length || 0,
      deadline: project.deadline,
      budget: {
        min: project.budgetMin,
        max: project.budgetMax,
      },
    }));
  }

  private static async getApplicationStats(userId: number): Promise<ClientApplicationStats> {
    const projects = await Project.findAll({
      where: { clientId: userId },
      include: [
        {
          model: ProjectApplication,
          include: [
            {
              model: User,
              as: 'Freelancer',
              attributes: ['name', 'rating'],
            },
          ],
        },
      ],
    });

    let totalApplicationsReceived = 0;
    let newApplications = 0;
    let interviewsScheduled = 0;

    const applicationsByProject = projects.map((project) => {
      const applications = project.ProjectApplications || [];
      totalApplicationsReceived += applications.length;

      const projectStats = {
        projectTitle: project.title,
        totalApplications: applications.length,
        newApplications: applications.filter((app) => app.status === 'applied').length,
        shortlisted: applications.filter((app) => app.status === 'marked_for_interview').length,
      };

      newApplications += projectStats.newApplications;
      interviewsScheduled += projectStats.shortlisted;

      return projectStats;
    });

    return {
      totalApplicationsReceived,
      newApplications,
      interviewsScheduled,
      applicationsByProject,
    };
  }

  private static async getProjectTimelines(userId: number): Promise<ProjectTimeline[]> {
    const projects = await Project.findAll({
      where: {
        clientId: userId,
        status: {
          [Op.in]: [ProjectStatus.PUBLISHED, ProjectStatus.IN_PROGRESS],
        },
      },
    });

    const now = new Date();

    return projects.map((project) => {
      const totalDays = Math.ceil((project.deadline.getTime() - project.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      const remainingDays = Math.ceil((project.deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const completionPercentage = ((totalDays - remainingDays) / totalDays) * 100;

      return {
        projectTitle: project.title,
        daysRemaining: remainingDays,
        status: project.status,
        completionPercentage: Math.min(Math.max(completionPercentage, 0), 100), // Ensure between 0-100
      };
    });
  }
}

export default ClientDashboardService;
