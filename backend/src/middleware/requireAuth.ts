import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types';

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. No token provided.' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'supersecretkeytravelplanner123!';
    const decoded = jwt.verify(token, secret) as { id: string; email: string };
    
    req.user = {
      id: decoded.id,
      email: decoded.email
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Authentication required. Invalid or expired token.' });
  }
};
