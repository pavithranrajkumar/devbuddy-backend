import { seedSkills } from './skills.seed';
import { seedUsers } from './users.seed';

export const runSeeds = async () => {
  try {
    await seedSkills();
    await seedUsers();
    console.log('All seeds completed successfully');
  } catch (error) {
    console.error('Error running seeds:', error);
  }
};
