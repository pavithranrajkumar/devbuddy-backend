import express from 'express';
import ProjectController from '../controllers/project.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { createProjectSchema, updateProjectSchema } from '../validations/project.schema';

const router = express.Router();

router.post('/', authenticate, validateRequest({ body: createProjectSchema }), ProjectController.create);

router.put('/:id', authenticate, validateRequest({ body: updateProjectSchema }), ProjectController.update);

router.get('/:id', authenticate, ProjectController.getOne);

router.get('/', authenticate, ProjectController.getAll);

router.get('/matching', authenticate, ProjectController.getMatching);

export default router;
