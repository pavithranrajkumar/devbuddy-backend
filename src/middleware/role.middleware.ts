import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { UnauthorizedError } from '../utils/errors';

export const isClient = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.userType !== 'client') {
    throw new UnauthorizedError('Only clients can access this route');
  }
  next();
};

export const isFreelancer = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.userType !== 'freelancer') {
    throw new UnauthorizedError('Only freelancers can access this route');
  }
  next();
};
