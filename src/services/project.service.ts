import { Op } from 'sequelize';
import Project, { ProjectStatus } from '../models/project.model';
import User, { UserType } from '../models/user.model';
import Skill from '../models/skill.model';
import { NotFoundError } from '../utils/errors';
import UserSkill from '@/models/userSkill.model';

interface CreateProjectDTO {
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  deadline: Date;
  skills: number[];
}

interface UpdateProjectDTO extends Partial<CreateProjectDTO> {}

export type ProjectSortField = 'createdAt' | 'budgetMin' | 'deadline' | 'applicantsCount';
export type SortOrder = 'asc' | 'desc';

export interface ProjectFilters {
  status?: string;
  budgetMin?: number;
  budgetMax?: number;
  skills?: number[];
  search?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  hasDeadlineBefore?: Date;
  experienceRequired?: number;
  sort?: {
    field: ProjectSortField;
    order: SortOrder;
  };
  clientId?: number;
}

class ProjectService {
  static async createProject(clientId: number, data: CreateProjectDTO): Promise<Project> {
    const { skills, ...projectData } = data;

    const project = await Project.create({
      ...projectData,
      clientId,
      status: ProjectStatus.PUBLISHED,
      applicantsCount: 0,
    });

    if (skills?.length) {
      await project.setSkills(skills);
    }

    return project;
  }

  static async updateProject(projectId: number, clientId: number, data: UpdateProjectDTO): Promise<Project> {
    const project = await Project.findOne({
      where: { id: projectId, clientId },
    });

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const { skills, ...updateData } = data;

    await project.update(updateData);

    if (skills) {
      await project.setSkills(skills);
    }

    return project;
  }

  static async getProject(projectId: number): Promise<Project> {
    const project = await Project.findByPk(projectId, {
      include: [
        {
          model: Skill,
          as: 'skills',
          through: { attributes: [] }, // Excludes junction table attributes
        },
        {
          model: User,
          as: UserType.CLIENT,
          attributes: ['id', 'name', 'rating'],
        },
      ],
    });

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    return project;
  }

  static async getProjects(filters: ProjectFilters, userType?: UserType, clientId?: number) {
    const where = {
      ...(filters.status && { status: filters.status }),
      ...(filters.budgetMin && { budgetMax: { [Op.gte]: filters.budgetMin } }),
      ...(filters.budgetMax && { budgetMin: { [Op.lte]: filters.budgetMax } }),
      ...(filters.search && {
        [Op.or]: [{ title: { [Op.iLike]: `%${filters.search}%` } }, { description: { [Op.iLike]: `%${filters.search}%` } }],
      }),
      ...(userType === UserType.CLIENT && clientId !== undefined && { clientId }),
    };

    const projects = await Project.findAll({
      where,
      include: [
        {
          model: User,
          as: UserType.CLIENT,
          attributes: ['id', 'name', 'rating'],
        },
        {
          model: Skill,
          as: 'skills',
          through: { attributes: [] },
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return {
      projects,
      total: projects.length,
    };
  }

  static async getMatchingProjects(freelancerId: number, filters: ProjectFilters) {
    const freelancer = await User.findByPk(freelancerId, {
      include: [
        {
          model: Skill,
          as: 'skills',
          through: { attributes: [] },
        },
      ],
    });

    if (!freelancer) {
      throw new NotFoundError('Freelancer not found');
    }

    const freelancerSkillIds = freelancer.skills?.map((skill) => skill.id) || [99999999999];

    return this.getProjects(
      {
        status: ProjectStatus.PUBLISHED,
        ...filters,
        skills: freelancerSkillIds,
      },
      UserType.FREELANCER
    );
  }
}

export default ProjectService;
