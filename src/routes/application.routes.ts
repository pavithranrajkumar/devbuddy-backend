import express from 'express';
import ApplicationController from '../controllers/application.controller';
import { authenticate } from '../middleware/auth.middleware';
import { isClient, isFreelancer } from '../middleware/role.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { createApplicationSchema, updateApplicationStatusSchema, applicationQuerySchema } from '../validations/application.schema';
import { z } from 'zod';

const router = express.Router();

// Freelancer routes
router.post(
  '/projects/:projectId/apply',
  authenticate,
  isFreelancer,
  validateRequest({
    body: createApplicationSchema,
    params: z.object({ projectId: z.string() }),
  }),
  ApplicationController.apply
);

router.get(
  '/',
  authenticate,
  validateRequest({
    query: applicationQuerySchema,
  }),
  ApplicationController.getApplications
);

router.delete(
  '/:id/withdraw',
  authenticate,
  isFreelancer,
  validateRequest({
    params: z.object({ id: z.string() }),
  }),
  ApplicationController.withdraw
);

// Client routes
router.put(
  '/:id/status',
  authenticate,
  isClient,
  validateRequest({
    params: z.object({ id: z.string() }),
    body: updateApplicationStatusSchema,
  }),
  ApplicationController.updateStatus
);

export default router;
