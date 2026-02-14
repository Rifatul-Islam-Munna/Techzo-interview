import { Router } from 'express';
import * as postController from '@/controllers/post.controller';
import { authenticate } from '@/middlewares/auth.middleware';

const router = Router();

// Post routes
router.get('/', postController.getAllPosts);
router.get('/my', authenticate, postController.getMyPosts);
router.get('/search', postController.searchPostsByUsername);
router.get('/:postId', postController.getPostById);
router.post('/', authenticate, postController.createPost);
router.patch('/:postId/like', authenticate, postController.toggleLike);

// Comment routes
router.get('/:postId/comments', postController.getCommentsByPostId);
router.post('/:postId/comments', authenticate, postController.createComment);

export default router;
