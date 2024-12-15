import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import User, { UserType } from '../models/user.model';
import Project, { ProjectStatus } from '../models/project.model';
import ProjectApplication, { ProjectApplicationStatus } from '../models/projectApplication.model';
import UserSkill from '../models/userSkill.model';
import Skill from '../models/skill.model';
import ProjectSkill from '../models/projectSkill.model';
import sequelize from '../config/database.config';

const SALT_ROUNDS = 10;

// More predefined users for better testing
const PREDEFINED_USERS = [
  { email: 'fe.dev@buddy.co', type: UserType.FREELANCER, skills: ['React', 'TypeScript', 'CSS', 'HTML'] },
  { email: 'be.dev@buddy.co', type: UserType.FREELANCER, skills: ['Node.js', 'Python', 'MongoDB', 'PostgreSQL'] },
  { email: 'fs.dev@buddy.co', type: UserType.FREELANCER, skills: ['React', 'Node.js', 'TypeScript', 'MongoDB'] },
  { email: 'devops@buddy.co', type: UserType.FREELANCER, skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD'] },
  { email: 'mobile.dev@buddy.co', type: UserType.FREELANCER, skills: ['React Native', 'iOS', 'Android'] },
  { email: 'ui.dev@buddy.co', type: UserType.FREELANCER, skills: ['Figma', 'HTML', 'CSS'] },
  { email: 'client1@buddy.co', type: UserType.CLIENT },
  { email: 'client2@buddy.co', type: UserType.CLIENT },
  { email: 'client3@buddy.co', type: UserType.CLIENT },
  { email: 'enterprise@buddy.co', type: UserType.CLIENT },
];

// Extended skills list
const SKILLS = [
  { name: 'React', category: 'Frontend' },
  { name: 'Angular', category: 'Frontend' },
  { name: 'Vue.js', category: 'Frontend' },
  { name: 'TypeScript', category: 'Frontend' },
  { name: 'HTML', category: 'Frontend' },
  { name: 'CSS', category: 'Frontend' },
  { name: 'Node.js', category: 'Backend' },
  { name: 'Python', category: 'Backend' },
  { name: 'Java', category: 'Backend' },
  { name: 'MongoDB', category: 'Database' },
  { name: 'PostgreSQL', category: 'Database' },
  { name: 'MySQL', category: 'Database' },
  { name: 'Docker', category: 'DevOps' },
  { name: 'Kubernetes', category: 'DevOps' },
  { name: 'AWS', category: 'DevOps' },
  { name: 'CI/CD', category: 'DevOps' },
  { name: 'React Native', category: 'Mobile' },
  { name: 'iOS', category: 'Mobile' },
  { name: 'Android', category: 'Mobile' },
  { name: 'Figma', category: 'Design' },
  { name: 'UI/UX', category: 'Design' },
  { name: 'GraphQL', category: 'Backend' },
  { name: 'Redis', category: 'Database' },
  { name: 'Azure', category: 'DevOps' },
  { name: 'GCP', category: 'DevOps' },
];

// Project templates for different scenarios
const PROJECT_TEMPLATES = [
  {
    status: ProjectStatus.COMPLETED,
    applicationsConfig: { min: 5, max: 10, hasAccepted: true },
    count: 10,
  },
  {
    status: ProjectStatus.IN_PROGRESS,
    applicationsConfig: { min: 3, max: 7, hasAccepted: true },
    count: 8,
  },
  {
    status: ProjectStatus.PUBLISHED,
    applicationsConfig: { min: 0, max: 15, hasAccepted: false },
    count: 15,
  },
  {
    status: ProjectStatus.CANCELLED,
    applicationsConfig: { min: 2, max: 5, hasAccepted: false },
    count: 5,
  },
];

// Budget ranges by project type
const BUDGET_RANGES = {
  SMALL: { min: 500, max: 2000 },
  MEDIUM: { min: 2000, max: 10000 },
  LARGE: { min: 10000, max: 50000 },
  ENTERPRISE: { min: 50000, max: 200000 },
};

async function createProjectApplications(project: Project, freelancers: User[], config: { min: number; max: number; hasAccepted: boolean }) {
  const applicantCount = faker.number.int({ min: config.min, max: config.max });
  const applicants = faker.helpers.arrayElements(freelancers, applicantCount);

  const applications = [];
  let hasAccepted = false;

  for (const freelancer of applicants) {
    let status;
    if (config.hasAccepted && !hasAccepted) {
      status = ProjectApplicationStatus.ACCEPTED;
      hasAccepted = true;
    } else {
      status = faker.helpers.arrayElement([
        ProjectApplicationStatus.APPLIED,
        ProjectApplicationStatus.MARKED_FOR_INTERVIEW,
        ProjectApplicationStatus.REJECTED,
        ProjectApplicationStatus.WITHDRAWN,
      ]);
    }

    // Propose rate within project budget range
    const minRate = Math.min(
      Math.max(20, Math.floor(project.budgetMin / 100)),
      180 // Cap minimum to ensure valid range
    );
    const maxRate = Math.max(
      minRate + 20, // Ensure at least $20 difference
      Math.min(200, Math.ceil(project.budgetMax / 100))
    );

    const proposedRate = faker.number.int({
      min: minRate,
      max: maxRate,
    });

    const application = await ProjectApplication.create(
      {
        projectId: project.id,
        freelancerId: freelancer.id,
        proposedRate: proposedRate,
        coverLetter: faker.lorem.paragraphs(2),
        estimatedDuration: faker.number.int({ min: 1, max: 500 }), // Duration in days
        status,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      },
      { validate: false }
    );

    applications.push(application);
  }

  return applications;
}

export async function seedDatabase() {
  try {
    console.log('Creating skills...');
    const createdSkills = await Skill.bulkCreate(SKILLS);
    const skillMap = new Map(createdSkills.map((skill) => [skill.name, skill]));

    console.log('Creating users...');
    const hashedPassword = await bcrypt.hash('Password123!', SALT_ROUNDS);
    const users = await Promise.all(
      PREDEFINED_USERS.map(async (userData) => {
        const user = await User.create(
          {
            email: userData.email,
            password: hashedPassword,
            name: faker.person.fullName(),
            title: faker.person.jobTitle(),
            bio: faker.lorem.paragraphs(2),
            hourlyRate: faker.number.int({ min: 20, max: 150 }),
            rating: faker.number.float({ min: 1, max: 5 }),
            userType: userData.type,
            experienceInMonths: faker.number.int({ min: 12, max: 120 }),
            activeProjectsCount: 0, // Will be updated later
            completedProjectsCount: 0, // Will be updated later
          },
          { validate: false }
        );

        if (userData.type === UserType.FREELANCER && userData.skills) {
          await Promise.all(
            userData.skills.map((skillName) =>
              UserSkill.create(
                {
                  userId: user.id,
                  skillId: skillMap.get(skillName)!.id,
                  proficiencyLevel: faker.helpers.arrayElement(['beginner', 'intermediate', 'expert']),
                },
                { validate: false }
              )
            )
          );
        }

        return user;
      })
    );

    const clients = users.filter((user) => user.userType === UserType.CLIENT);
    const freelancers = users.filter((user) => user.userType === UserType.FREELANCER);

    console.log('Creating projects and applications...');
    for (const template of PROJECT_TEMPLATES) {
      for (let i = 0; i < template.count; i++) {
        const client = faker.helpers.arrayElement(clients);

        // Create project
        const project = await Project.create(
          {
            clientId: client.id,
            title: faker.company.catchPhrase(),
            description: faker.lorem.paragraphs(3),
            applicantsCount: 0, // Initialize with 0, will be updated after creating applications
            ...(() => {
              const budgetType = faker.helpers.arrayElement(['SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE']) as keyof typeof BUDGET_RANGES;
              const range = BUDGET_RANGES[budgetType];
              return {
                budgetMin: faker.number.int({ min: range.min, max: range.max - 500 }),
                budgetMax: faker.number.int({ min: range.min + 500, max: range.max }),
              };
            })(),
            deadline: template.status === ProjectStatus.COMPLETED ? faker.date.past() : faker.date.future(),
            status: template.status,
            createdAt: faker.date.past(),
            updatedAt: faker.date.recent(),
          },
          { validate: false }
        );

        // Add skills to project
        const projectSkills = faker.helpers.arrayElements(createdSkills, { min: 3, max: 6 });
        await Promise.all(
          projectSkills.map((skill) =>
            ProjectSkill.create(
              {
                projectId: project.id,
                skillId: skill.id,
              },
              { validate: false }
            )
          )
        );

        // Create applications
        await createProjectApplications(project, freelancers, template.applicationsConfig);
      }
    }

    // Update freelancer project counts
    console.log('Updating freelancer statistics...');
    for (const freelancer of freelancers) {
      const applications = await ProjectApplication.findAll({
        where: { freelancerId: freelancer.id },
        include: [
          {
            model: Project,
            as: 'Project',
            attributes: ['status'],
          },
        ],
      });

      const activeCount = applications.filter(
        (app) => app.status === ProjectApplicationStatus.ACCEPTED && app.Project.status === ProjectStatus.IN_PROGRESS
      ).length;

      const completedCount = applications.filter(
        (app) => app.status === ProjectApplicationStatus.ACCEPTED && app.Project.status === ProjectStatus.COMPLETED
      ).length;

      await freelancer.update({
        activeProjectsCount: activeCount,
        completedProjectsCount: completedCount,
      });
    }

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}
