import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { UnauthorizedError } from '../utils/errors';
import { UserType } from '../models/user.model';

export const isClient = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.userType !== UserType.CLIENT) {
    throw new UnauthorizedError('Only clients can access this route');
  }
  next();
};

export const isFreelancer = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.userType !== UserType.FREELANCER) {
    throw new UnauthorizedError('Only freelancers can access this route');
  }
  next();
};
