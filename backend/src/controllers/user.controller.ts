import { Request, Response, NextFunction } from 'express';
import * as userService from '@/services/user.service';
import { Constants } from '@/config/constants';

export const getAllUsers = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const users = await userService.getAllUsers();
    res.status(Constants.HTTP_STATUS.OK).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  console.log("creating user body")
  try {
    const user = await userService.createUser(req.body);
    res.status(Constants.HTTP_STATUS.CREATED).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password,token } = req.body;

    if (!email || !password ) {
      res.status(Constants.HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Please provide email and password',
      });
      return;
    }

    const result = await userService.login(email, password,token);

    if (!result) {
      res.status(Constants.HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    res.status(Constants.HTTP_STATUS.OK).json({
      success: true,
      data: {
        user: result.user,
        token: result.token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(Constants.HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const user = await userService.getUserById(userId);

    if (!user) {
      res.status(Constants.HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.status(Constants.HTTP_STATUS.OK).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
