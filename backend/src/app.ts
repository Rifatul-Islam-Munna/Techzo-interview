import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import morganMiddleware from '@/middlewares/morgan.middleware';

import router from '@/routes/index';
import { HttpException } from './utils/HttpException';
import { allExceptionsFilter } from './middlewares/allExceptionsFilter';

const app: Express = express();

// Logging
app.use(morganMiddleware);

// Security & Performance
app.use(helmet());
app.use(compression());
app.use(
	rateLimit({
		windowMs: 15 * 60 * 1000,
		max: 100,
		standardHeaders: true,
	}),
);

// CORS
app.use(cors({
  origin: '*', // In production, specify your frontend URL
  credentials: true,
}));

// Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1', router);


app.use((req, res, next) => {
    const error = new HttpException(404, `Route ${req.url} not found`);
    next(error);
});

// Global Error Handler (MUST be last)
app.use(allExceptionsFilter);

export default app;
