import { Op } from "sequelize";
import Project from "../models/project.model";
import User from "../models/user.model";
import Skill from "../models/skill.model";
import { NotFoundError } from "../utils/errors";

interface CreateProjectDTO {
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  deadline: Date;
  requiredSkills: number[];
}

interface UpdateProjectDTO extends Partial<CreateProjectDTO> {}

export type ProjectSortField =
  | "createdAt"
  | "budgetMin"
  | "deadline"
  | "applicantsCount";
export type SortOrder = "asc" | "desc";

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
  static async createProject(
    clientId: number,
    data: CreateProjectDTO
  ): Promise<Project> {
    return Project.create({
      ...data,
      clientId,
      status: "published",
      applicantsCount: 0,
    });
  }

  static async updateProject(
    projectId: number,
    clientId: number,
    data: UpdateProjectDTO
  ): Promise<Project> {
    const project = await Project.findOne({
      where: { id: projectId, clientId },
    });

    if (!project) {
      throw new NotFoundError("Project not found");
    }

    // Prevent updates if project has applications and trying to reduce budget
    if (project.applicantsCount > 0 && data.budgetMin && data.budgetMax) {
      const budgetReduced =
        data.budgetMin < project.budgetMin ||
        data.budgetMax < project.budgetMax;
      if (budgetReduced) {
        throw new Error("Cannot reduce budget after receiving applications");
      }
    }

    await project.update(data);
    return project;
  }

  static async getProject(projectId: number): Promise<Project> {
    const project = await Project.findByPk(projectId, {
      include: [
        {
          model: User,
          as: "client",
          attributes: ["id", "name", "rating"],
        },
        {
          model: Skill,
          as: "skills",
          through: { attributes: [] },
        },
      ],
    });

    if (!project) {
      throw new NotFoundError("Project not found");
    }

    return project;
  }

  static async getProjects(filters: ProjectFilters, page = 1, limit = 10) {
    try {
      const where: any = {};
      const include: any[] = [
        {
          model: User,
          as: "client",
          attributes: ["id", "name", "rating"],
        },
        {
          model: Skill,
          as: "skills",
          through: { attributes: [] },
        },
      ];

      // Only apply status filter if it's not "all" and exists
      if (filters.status && filters.status !== "all") {
        where.status = filters.status;
      }

      // Handle budget range filters
      if (typeof filters.budgetMin === "number" && !isNaN(filters.budgetMin)) {
        where.budgetMax = { [Op.gte]: filters.budgetMin };
      }

      if (typeof filters.budgetMax === "number" && !isNaN(filters.budgetMax)) {
        where.budgetMin = { [Op.lte]: filters.budgetMax };
      }

      // Handle search filter
      if (filters.search?.trim()) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${filters.search.trim()}%` } },
          { description: { [Op.iLike]: `%${filters.search.trim()}%` } },
        ];
      }

      // Handle deadline filter
      if (
        filters.hasDeadlineBefore instanceof Date &&
        !isNaN(filters.hasDeadlineBefore.getTime())
      ) {
        where.deadline = { [Op.lte]: filters.hasDeadlineBefore };
      }

      console.log("Query filters:", filters);
      console.log("Applied where clause:", where);

      const { count, rows } = await Project.findAndCountAll({
        where,
        include,
        distinct: true,
        offset: (page - 1) * limit,
        limit,
        order: [["createdAt", "DESC"]],
      });

      return {
        projects: rows,
        total: count,
        page,
        totalPages: Math.ceil(count / limit),
      };
    } catch (error) {
      console.error("Service error:", error);
      throw error;
    }
  }

  static async getMatchingProjects(freelancerId: number, page = 1, limit = 10) {
    const freelancer = await User.findByPk(freelancerId, {
      include: [{ model: Skill, as: "skills" }],
    });

    if (!freelancer) {
      throw new NotFoundError("Freelancer not found");
    }

    const freelancerSkillIds = freelancer.skills.map((skill) => skill.id);

    return this.getProjects(
      {
        status: "published",
        skills: freelancerSkillIds,
      },
      page,
      limit
    );
  }
}

export default ProjectService;
