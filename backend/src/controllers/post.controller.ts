import { Request, Response, NextFunction } from 'express';
import * as postService from '@/services/post.service';
import { Constants } from '@/config/constants';

// ==================== POST CONTROLLERS ====================

// Get all posts
export const getAllPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await postService.getAllPosts(page, limit);

    res.status(Constants.HTTP_STATUS.OK).json({
      success: true,
      data: result.posts,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

// Get my posts
export const getMyPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
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

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await postService.getMyPosts(userId, page, limit);

    res.status(Constants.HTTP_STATUS.OK).json({
      success: true,
      data: result.posts,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

// Search posts by username
export const searchPostsByUsername = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { username } = req.query;

    if (!username || typeof username !== 'string') {
      res.status(Constants.HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Username query parameter is required',
      });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await postService.searchPostsByUsername(username, page, limit);

    res.status(Constants.HTTP_STATUS.OK).json({
      success: true,
      data: result.posts,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

// Create post
export const createPost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userName = req.user?.name;
    const { description } = req.body;

    if (!userId || !userName) {
      res.status(Constants.HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    if (!description) {
      res.status(Constants.HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Description is required',
      });
      return;
    }

    const post = await postService.createPost(userId, userName, description);
    res.status(Constants.HTTP_STATUS.CREATED).json({
      success: true,
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

// Get single post
export const getPostById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { postId } = req.params;

    const post = await postService.getPostById(postId);

    if (!post) {
      res.status(Constants.HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Post not found',
      });
      return;
    }

    res.status(Constants.HTTP_STATUS.OK).json({
      success: true,
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

// Update like count
export const toggleLike = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { postId } = req.params;
    const { increment } = req.body;

    const post = await postService.updateLikeCount(postId, increment);

    if (!post) {
      res.status(Constants.HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Post not found',
      });
      return;
    }

    res.status(Constants.HTTP_STATUS.OK).json({
      success: true,
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== COMMENT CONTROLLERS ====================

// Get all comments for a post
export const getCommentsByPostId = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await postService.getCommentsByPostId(postId, page, limit);

    res.status(Constants.HTTP_STATUS.OK).json({
      success: true,
      data: result.comments,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

// Create comment
export const createComment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userName = req.user?.name;
    const { postId } = req.params;
    const { text } = req.body;

    if (!userId || !userName) {
      res.status(Constants.HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    if (!text) {
      res.status(Constants.HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Comment text is required',
      });
      return;
    }

    const comment = await postService.createComment(postId, userId, userName, text);

    if (!comment) {
      res.status(Constants.HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Post not found',
      });
      return;
    }

    res.status(Constants.HTTP_STATUS.CREATED).json({
      success: true,
      data: comment,
    });
  } catch (error) {
    next(error);
  }
};
