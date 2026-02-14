import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Constants } from '@/config/constants';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      res.status(Constants.HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'No token provided',
      });
      return;
    }

    const decoded = jwt.verify(token, Constants.JWT_SECRET) as {
      id: string;
      email: string;
      name:string
    };

    req.user = decoded;
    next();
  } catch (error) {
    res.status(Constants.HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Invalid token',
    });
  }
};
