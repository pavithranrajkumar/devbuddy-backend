import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import sequelize, { testConnection } from './config/database.config';
import './models/user.model'; // Import the model
import './models/skill.model';
import authRoutes from './routes/auth.routes';
import skillRoutes from './routes/skill.routes';
import userSkillRoutes from './routes/userSkill.routes';
import { errorHandler } from './middleware/error.middleware';
import Skill from './models/skill.model';
import { runSeeds } from './seeds';
import projectRoutes from './routes/project.routes';
import applicationRoutes from './routes/application.routes';
dotenv.config();

const app: Application = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/user/skills', userSkillRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/applications', applicationRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('DevBuddy API is running!');
});

// Error handling middleware (should be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);

  await testConnection();
  // await sequelize.sync({ alter: true });

  // Run seeds (uncomment when needed)
  // await runSeeds();

  console.log('Database synced');
});

export default app;
