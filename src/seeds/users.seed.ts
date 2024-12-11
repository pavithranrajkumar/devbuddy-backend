import User from '../models/user.model';
import UserSkill from '../models/userSkill.model';
import bcrypt from 'bcrypt';

const DEFAULT_PASSWORD = 'Password123!';

export const seedUsers = async () => {
  try {
    // Create users
    const users = [
      {
        id: 1,
        email: 'client@buddy.co',
        name: 'John Client',
        userType: 'client',
        password: await bcrypt.hash(DEFAULT_PASSWORD, 10),
      },
      {
        id: 2,
        email: 'fe.dev@buddy.co',
        name: 'Sarah Frontend',
        userType: 'freelancer',
        title: 'Frontend Developer',
        bio: 'Specialized in React and modern frontend technologies',
        hourlyRate: 45,
        experienceInMonths: 36,
        password: await bcrypt.hash(DEFAULT_PASSWORD, 10),
      },
      {
        id: 3,
        email: 'be.dev@buddy.co',
        name: 'Mike Backend',
        userType: 'freelancer',
        title: 'Backend Developer',
        bio: 'Expert in Node.js and API development',
        hourlyRate: 50,
        experienceInMonths: 48,
        password: await bcrypt.hash(DEFAULT_PASSWORD, 10),
      },
      {
        id: 4,
        email: 'fs.dev@buddy.co',
        name: 'Alex Fullstack',
        userType: 'freelancer',
        title: 'Full Stack Developer',
        bio: 'Full stack developer with expertise in MERN stack',
        hourlyRate: 60,
        experienceInMonths: 60,
        password: await bcrypt.hash(DEFAULT_PASSWORD, 10),
      },
      {
        id: 5,
        email: 'db.dev@buddy.co',
        name: 'Diana Database',
        userType: 'freelancer',
        title: 'Database Specialist',
        bio: 'Database expert with focus on performance optimization',
        hourlyRate: 55,
        experienceInMonths: 42,
        password: await bcrypt.hash(DEFAULT_PASSWORD, 10),
      },
    ];

    for (const user of users) {
      await User.findOrCreate({
        where: { id: user.id },
        defaults: {
          ...user,
          userType: user.userType as 'freelancer' | 'client' | 'admin',
        },
      });
    }

    // Add skills to users
    const userSkills = [
      // Frontend Developer Skills
      { userId: 2, skillId: 1, proficiencyLevel: 'expert' }, // JavaScript
      { userId: 2, skillId: 10, proficiencyLevel: 'expert' }, // React
      { userId: 2, skillId: 11, proficiencyLevel: 'expert' }, // HTML5
      { userId: 2, skillId: 12, proficiencyLevel: 'expert' }, // CSS3
      { userId: 2, skillId: 14, proficiencyLevel: 'intermediate' }, // Tailwind

      // Backend Developer Skills
      { userId: 3, skillId: 20, proficiencyLevel: 'expert' }, // Node.js
      { userId: 3, skillId: 21, proficiencyLevel: 'expert' }, // Express.js
      { userId: 3, skillId: 22, proficiencyLevel: 'intermediate' }, // Django
      { userId: 3, skillId: 31, proficiencyLevel: 'intermediate' }, // PostgreSQL

      // Full Stack Developer Skills
      { userId: 4, skillId: 1, proficiencyLevel: 'expert' }, // JavaScript
      { userId: 4, skillId: 10, proficiencyLevel: 'expert' }, // React
      { userId: 4, skillId: 20, proficiencyLevel: 'expert' }, // Node.js
      { userId: 4, skillId: 21, proficiencyLevel: 'expert' }, // Express.js
      { userId: 4, skillId: 32, proficiencyLevel: 'intermediate' }, // MongoDB

      // Database Specialist Skills
      { userId: 5, skillId: 30, proficiencyLevel: 'expert' }, // MySQL
      { userId: 5, skillId: 31, proficiencyLevel: 'expert' }, // PostgreSQL
      { userId: 5, skillId: 32, proficiencyLevel: 'expert' }, // MongoDB
      { userId: 5, skillId: 33, proficiencyLevel: 'expert' }, // Redis
    ];

    for (const skill of userSkills) {
      await UserSkill.findOrCreate({
        where: {
          userId: skill.userId,
          skillId: skill.skillId,
        },
        defaults: {
          userId: skill.userId,
          skillId: skill.skillId,
          proficiencyLevel: skill.proficiencyLevel as 'expert' | 'intermediate' | 'beginner',
        },
      });
    }

    console.log('Users and their skills seeded successfully');
  } catch (error) {
    console.error('Error seeding users:', error);
  }
};
