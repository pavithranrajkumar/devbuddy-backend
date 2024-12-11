import Skill from '../models/skill.model';

export const skills = [
  // Programming Languages
  { id: 1, name: 'JavaScript', category: 'Programming Languages' },
  { id: 2, name: 'Python', category: 'Programming Languages' },
  { id: 3, name: 'TypeScript', category: 'Programming Languages' },

  // Frontend
  { id: 10, name: 'React', category: 'Frontend' },
  { id: 11, name: 'HTML5', category: 'Frontend' },
  { id: 12, name: 'CSS3', category: 'Frontend' },
  { id: 13, name: 'Next.js', category: 'Frontend' },
  { id: 14, name: 'Tailwind CSS', category: 'Frontend' },

  // Backend
  { id: 20, name: 'Node.js', category: 'Backend' },
  { id: 21, name: 'Express.js', category: 'Backend' },
  { id: 22, name: 'Django', category: 'Backend' },
  { id: 23, name: 'Spring Boot', category: 'Backend' },

  // Database
  { id: 30, name: 'MySQL', category: 'Database' },
  { id: 31, name: 'PostgreSQL', category: 'Database' },
  { id: 32, name: 'MongoDB', category: 'Database' },
  { id: 33, name: 'Redis', category: 'Database' },
];

export const seedSkills = async () => {
  try {
    for (const skill of skills) {
      await Skill.findOrCreate({
        where: { id: skill.id },
        defaults: skill,
      });
    }
    console.log('Skills seeded successfully');
  } catch (error) {
    console.error('Error seeding skills:', error);
  }
};
