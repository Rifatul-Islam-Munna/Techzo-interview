import dotenv from 'dotenv';
import app from './app';

import config from '@/config/environment';
import logger from '@/utils/logger';
import { connectDatabase } from '@/config/database';

dotenv.config();

const startServer = async (): Promise<void> => {
	try {
		await connectDatabase();

		const server = app.listen(config.port, () => {
			logger.info(
				`Server running in ${config.env} mode at http://${config.host}:${config.port}`,
			);
		});
		app.listen(config.port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${config.port}`);
  console.log(`Local access: http://localhost:${config.port}`);
  console.log(`Network access: http://192.168.0.104:${config.port}`);
});

		const shutdown = async (signal: string): Promise<void> => {
			logger.info(`${signal} received. Shutting down gracefully...`);

			server.close(async () => {
				await connectDatabase();
				logger.info('Server closed.');
				process.exit(0);
			});

			setTimeout(() => {
				logger.error('Forced shutdown after timeout');
				process.exit(1);
			}, 10000);
		};

		process.on('SIGINT', () => shutdown('SIGINT'));
		process.on('SIGTERM', () => shutdown('SIGTERM'));
	} catch (error) {
		logger.error('Failed to start server:', error as any);
		process.exit(1);
	}
};

startServer();
