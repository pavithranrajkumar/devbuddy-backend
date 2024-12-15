import { NotFoundError, BadRequestError, UnauthorizedError } from '../utils/errors';
import Project, { ProjectStatus } from '../models/project.model';
import ProjectApplication, { ProjectApplicationStatus } from '../models/projectApplication.model';
import User, { UserType } from '../models/user.model';
import { Op } from 'sequelize';
import { PaginatedResponse } from '../types/pagination.types';

interface CreateApplicationDTO {
  coverLetter: string;
  proposedRate: number;
  estimatedDuration: number;
}

class ApplicationService {
  static async applyToProject(freelancerId: number, projectId: number, data: CreateApplicationDTO): Promise<ProjectApplication> {
    const project = await Project.findOne({
      where: {
        id: projectId,
        status: ProjectStatus.PUBLISHED,
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
      status: ProjectApplicationStatus.APPLIED,
    });

    await project.increment('applicantsCount');

    return application;
  }

  static async updateApplicationStatus(
    applicationId: number,
    newStatus: ProjectApplicationStatus,
    userId: number,
    rejectionReason?: string
  ): Promise<ProjectApplication> {
    const application = await ProjectApplication.findByPk(applicationId, {
      include: [{ model: Project, as: 'Project' }],
    });

    if (!application) {
      throw new NotFoundError('Application not found');
    }

    const allowedTransitions = this.getAllowedTransitions(application.status, userId === application.Project.clientId);
    if (!allowedTransitions.includes(newStatus)) {
      throw new BadRequestError(`Cannot transition from ${application.status} to ${newStatus}`);
    }

    if (newStatus === ProjectApplicationStatus.ACCEPTED) {
      await this.handleAcceptance(application);
    }

    await application.update({
      status: newStatus as ProjectApplicationStatus,
      ...(rejectionReason && { rejectionReason }),
    });
    return application;
  }

  private static getAllowedTransitions(currentStatus: ProjectApplicationStatus, isClient: boolean): ProjectApplicationStatus[] {
    const transitions: Record<
      ProjectApplicationStatus,
      {
        client: ProjectApplicationStatus[];
        freelancer: ProjectApplicationStatus[];
      }
    > = {
      applied: {
        client: [ProjectApplicationStatus.MARKED_FOR_INTERVIEW, ProjectApplicationStatus.ACCEPTED, ProjectApplicationStatus.REJECTED],
        freelancer: [ProjectApplicationStatus.WITHDRAWN],
      },
      marked_for_interview: {
        client: [ProjectApplicationStatus.ACCEPTED, ProjectApplicationStatus.REJECTED],
        freelancer: [ProjectApplicationStatus.WITHDRAWN],
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
      completed: {
        client: [],
        freelancer: [],
      },
    };

    return transitions[currentStatus][isClient ? UserType.CLIENT : UserType.FREELANCER];
  }

  private static async handleAcceptance(application: ProjectApplication): Promise<void> {
    await Project.update({ status: ProjectStatus.IN_PROGRESS }, { where: { id: application.projectId } });

    await ProjectApplication.update(
      { status: ProjectApplicationStatus.REJECTED },
      {
        where: {
          projectId: application.projectId,
          id: { [Op.ne]: application.id },
          status: { [Op.notIn]: [ProjectApplicationStatus.WITHDRAWN, ProjectApplicationStatus.REJECTED] },
        },
      }
    );
  }

  static async getApplications(
    userId: number,
    userRole: string,
    filters: { status?: ProjectApplicationStatus[]; projectId?: number } = {},
    pagination?: { page?: number; limit?: number }
  ): Promise<PaginatedResponse<ProjectApplication> | ProjectApplication[]> {
    const where: any = {};
    if (filters.status?.length) {
      where.status = filters.status;
    }

    if (filters.projectId) {
      where.projectId = filters.projectId;
    }

    const queryOptions: any = {
      where,
      include: [
        {
          model: Project,
          as: 'Project',
          include: [
            {
              model: User,
              as: UserType.CLIENT,
              attributes: ['id', 'name', 'rating'],
            },
          ],
        },
        {
          model: User,
          as: UserType.FREELANCER,
          attributes: ['id', 'name', 'rating', 'title'],
        },
      ],
      order: [['createdAt', 'DESC']],
    };

    // Add role-specific conditions
    if (userRole === UserType.FREELANCER) {
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

    if (!this.getAllowedTransitions(application.status, false).includes(ProjectApplicationStatus.WITHDRAWN)) {
      throw new BadRequestError('Cannot withdraw application in current status');
    }

    await application.update({ status: ProjectApplicationStatus.WITHDRAWN });
    return application;
  }
}

export default ApplicationService;
