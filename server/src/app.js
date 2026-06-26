import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/index.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

// Builds and configures the Express app. Routes are mounted here as they are
// added (auth, students, teachers, groups, attendance, payments, reports,
// dashboard) in later milestones.
export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Liveness probe — confirms the API is up without touching the database.
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'center-management-api',
      time: new Date().toISOString(),
    });
  });

  app.use('/api', apiRoutes);

  // 404 + error handling must stay last.
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
