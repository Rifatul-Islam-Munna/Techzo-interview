import { Router } from 'express';
import userRoutes from './user.routes';
import PostRouter from './post.routes';

const router = Router();

// Health check
router.get('/health', (_req, res) =>
	res.status(200).json({
		status: 'OK',
		timestamp: new Date().toISOString(),
	}),
);

// All other route groups
router.use('/users', userRoutes);
router.use('/posts', PostRouter);

export default router;
