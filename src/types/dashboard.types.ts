import { ProjectStatus } from '@/models/project.model';
import { ProjectApplicationStatus } from '@/models/projectApplication.model';

// Common Types
export interface BaseStats {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

// Freelancer Dashboard Types
export interface FreelancerProfileOverview {
  name: string;
  title: string;
  rating: number;
  activeProjects: number;
  completedProjects: number;
  profileCompleteness: number;
}

export interface SkillStats {
  name: string;
  proficiencyLevel: 'beginner' | 'intermediate' | 'expert';
  category: string;
}

export interface ApplicationStats {
  totalApplications: number;
  activeApplications: number;
  successRate: number;
  statusBreakdown: Record<ProjectApplicationStatus, number>;
}

export interface RecentApplication {
  projectTitle: string;
  status: ProjectApplicationStatus;
  appliedDate: Date;
  proposedRate: number;
}

export interface MatchingProject {
  title: string;
  budgetRange: {
    min: number;
    max: number;
  };
  requiredSkills: string[];
  postedDate: Date;
  matchScore: number;
}

export interface FreelancerDashboardData {
  profileOverview: FreelancerProfileOverview;
  skills: SkillStats[];
  applicationStats: ApplicationStats;
  recentApplications: RecentApplication[];
  matchingProjects: MatchingProject[];
}

// Client Dashboard Types
export interface ProjectsOverview {
  activeProjects: number;
  totalProjects: number;
  totalBudget: number;
  projectsByStatus: Record<ProjectStatus, number>;
}

export interface RecentProject {
  title: string;
  status: string;
  applicantsCount: number;
  deadline: Date;
  budget: {
    min: number;
    max: number;
  };
}

export interface ClientApplicationStats {
  totalApplicationsReceived: number;
  newApplications: number;
  interviewsScheduled: number;
  applicationsByProject: Array<{
    projectTitle: string;
    totalApplications: number;
    newApplications: number;
    shortlisted: number;
  }>;
}

export interface ProjectTimeline {
  projectTitle: string;
  daysRemaining: number;
  status: string;
  completionPercentage: number;
}

export interface ClientDashboardData {
  projectsOverview: ProjectsOverview;
  recentProjects: RecentProject[];
  applicationStats: ClientApplicationStats;
  projectTimelines: ProjectTimeline[];
}
