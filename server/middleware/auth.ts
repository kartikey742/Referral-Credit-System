import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export interface AuthRequest extends Request {
  userId?: string;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ 
        success: false,
        message: 'No token provided. Authorization header must be in format: Bearer <token>' 
      });
      return;
    }

    const token = authHeader.replace('Bearer ', '');

    const decoded = verifyToken(token);

    if (!decoded) {
      res.status(401).json({ 
        success: false,
        message: 'Invalid or expired token' 
      });
      return;
    }

    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false,
      message: 'Authentication failed' 
    });
  }
};