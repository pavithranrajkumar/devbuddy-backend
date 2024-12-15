import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { isFreelancer, isClient } from '../middleware/role.middleware';
import DashboardController from '../controllers/dashboard.controller';

const router = express.Router();

router.get('/freelancer', authenticate, isFreelancer, DashboardController.getFreelancerDashboard);

router.get('/client', authenticate, isClient, DashboardController.getClientDashboard);

export default router;
