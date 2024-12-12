import { NotFoundError, BadRequestError, UnauthorizedError } from '../utils/errors';
import Project from '../models/project.model';
import ProjectApplication from '../models/projectApplication.model';
import User from '../models/user.model';
import { Op } from 'sequelize';
import { PaginationParams, PaginatedResponse } from '../types/pagination.types';

interface CreateApplicationDTO {
  coverLetter: string;
  proposedRate: number;
  estimatedDuration: number;
}

export type ApplicationStatus = 'applied' | 'marked_for_interview' | 'accepted' | 'rejected' | 'withdrawn';

class ApplicationService {
  static async applyToProject(freelancerId: number, projectId: number, data: CreateApplicationDTO): Promise<ProjectApplication> {
    const project = await Project.findOne({
      where: {
        id: projectId,
        status: 'published',
      },
    });

    if (!project) {
      throw new NotFoundError('Project not found or not accepting applications');
    }

    if (data.proposedRate < project.budgetMin || data.proposedRate > project.budgetMax) {
      throw new BadRequestError('Proposed rate must be within project budget range');
    }

    const existingApplication = await ProjectApplication.findOne({
      where: { projectId, freelancerId },
    });

    if (existingApplication) {
      throw new BadRequestError('You have already applied to this project');
    }

    const application = await ProjectApplication.create({
      ...data,
      projectId,
      freelancerId,
      status: 'applied',
    });

    await project.increment('applicantsCount');

    return application;
  }

  static async updateApplicationStatus(applicationId: number, newStatus: ApplicationStatus, userId: number): Promise<ProjectApplication> {
    const application = await ProjectApplication.findByPk(applicationId, {
      include: [{ model: Project }],
    });

    if (!application) {
      throw new NotFoundError('Application not found');
    }

    const allowedTransitions = this.getAllowedTransitions(application.status, userId === application.Project.clientId);
    if (!allowedTransitions.includes(newStatus)) {
      throw new BadRequestError(`Cannot transition from ${application.status} to ${newStatus}`);
    }

    if (newStatus === 'accepted') {
      await this.handleAcceptance(application);
    }

    await application.update({ status: newStatus });
    return application;
  }

  private static getAllowedTransitions(currentStatus: ApplicationStatus, isClient: boolean): ApplicationStatus[] {
    const transitions: Record<
      ApplicationStatus,
      {
        client: ApplicationStatus[];
        freelancer: ApplicationStatus[];
      }
    > = {
      applied: {
        client: ['marked_for_interview', 'accepted', 'rejected'],
        freelancer: ['withdrawn'],
      },
      marked_for_interview: {
        client: ['accepted', 'rejected'],
        freelancer: ['withdrawn'],
      },
      accepted: {
        client: [],
        freelancer: [],
      },
      rejected: {
        client: [],
        freelancer: [],
      },
      withdrawn: {
        client: [],
        freelancer: [],
      },
    };

    return transitions[currentStatus][isClient ? 'client' : 'freelancer'];
  }

  private static async handleAcceptance(application: ProjectApplication): Promise<void> {
    await Project.update({ status: 'in_progress' }, { where: { id: application.projectId } });

    await ProjectApplication.update(
      { status: 'rejected' },
      {
        where: {
          projectId: application.projectId,
          id: { [Op.ne]: application.id },
          status: { [Op.notIn]: ['withdrawn', 'rejected'] },
        },
      }
    );
  }

  static async getApplications(
    userId: number,
    userRole: string,
    filters: { status?: ApplicationStatus[]; projectId?: string } = {},
    pagination?: { page?: number; limit?: number }
  ): Promise<PaginatedResponse<ProjectApplication> | ProjectApplication[]> {
    const where: any = {};
    if (filters.status?.length) {
      where.status = filters.status;
    }

    const queryOptions: any = {
      where,
      include: [
        {
          model: Project,
          include: [
            {
              model: User,
              as: 'client',
              attributes: ['id', 'name', 'rating'],
            },
          ],
        },
        {
          model: User,
          as: 'freelancer',
          attributes: ['id', 'name', 'rating', 'title'],
        },
      ],
      order: [['createdAt', 'DESC']],
    };

    // Add role-specific conditions
    if (userRole === 'freelancer') {
      where.freelancerId = userId;

      // Apply pagination only for freelancer requests if pagination params exist
      if (pagination?.page && pagination?.limit) {
        const offset = (pagination.page - 1) * pagination.limit;
        queryOptions.offset = offset;
        queryOptions.limit = pagination.limit;

        const { count, rows } = await ProjectApplication.findAndCountAll(queryOptions);
        return {
          data: rows,
          pagination: {
            total: count,
            currentPage: pagination.page,
            totalPages: Math.ceil(count / pagination.limit),
            limit: pagination.limit,
          },
        };
      }
    } else if (userRole === 'client') {
      // For clients, get applications from all their projects
      const clientProjects = await Project.findAll({
        where: { clientId: userId },
        attributes: ['id'],
      });

      where.projectId = {
        [Op.in]: clientProjects.map((project) => project.id),
      };
    }

    // If no pagination or client request, return all results
    const applications = await ProjectApplication.findAll(queryOptions);
    return applications;
  }

  static async withdrawApplication(applicationId: number, freelancerId: number): Promise<ProjectApplication> {
    const application = await ProjectApplication.findOne({
      where: { id: applicationId, freelancerId },
    });

    if (!application) {
      throw new NotFoundError('Application not found');
    }

    if (!this.getAllowedTransitions(application.status, false).includes('withdrawn')) {
      throw new BadRequestError('Cannot withdraw application in current status');
    }

    await application.update({ status: 'withdrawn' });
    return application;
  }
}

export default ApplicationService;
