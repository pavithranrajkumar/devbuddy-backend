import express, { NextFunction, Response } from 'express';
import ProjectController from '../controllers/project.controller';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { createProjectSchema, updateProjectSchema } from '../validations/project.schema';
import { UserType } from '../models/user.model';

const router = express.Router();

router.post('/', authenticate, validateRequest({ body: createProjectSchema }), ProjectController.create);

router.put('/:id', authenticate, validateRequest({ body: updateProjectSchema }), ProjectController.update);

router.get('/:id', authenticate, ProjectController.getOne);

router.get('/', authenticate, (req: AuthRequest, res: Response, next: NextFunction) => {
  const userType = req.user?.userType;

  if (userType === UserType.CLIENT) {
    ProjectController.getAll(req, res, next);
  } else if (userType === UserType.FREELANCER) {
    ProjectController.getMatching(req, res, next);
  } else {
    res.status(403).json({ message: 'Invalid user type' });
  }
});

export default router;
