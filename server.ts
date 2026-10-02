import express from 'express';
import path from 'path';
import authRouter from './server/routes/auth';
import playerRouter from './server/routes/player';
import { careerRoutes, clubRoutes } from './server/routes/coreContent';
import imageRoutes from './server/routes/images';
import settingsRoutes from './server/routes/settings';
import { db } from './server/config/database';
import { getUploadConfig, storedImageName } from './server/config/uploads';

export const app = express();

app.use(express.json({ limit: '50mb' }));
app.use('/api/auth', authRouter);
app.use('/api/player', playerRouter);
app.use('/api', clubRoutes);
app.use('/api/career', careerRoutes);
app.use('/api', imageRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/api/health', async (_req, res) => {
  try {
    await db.query('SELECT 1');
    return res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('[Health] Database connection failed:', error);
    return res.status(503).json({ status: 'unavailable', database: 'unavailable' });
  }
});

const uploadConfig = getUploadConfig();
if (uploadConfig) {
  app.get(`${uploadConfig.mountPath}/:filename`, (req, res) => {
    const filename = req.params.filename;
    if (!storedImageName(filename)) { res.status(404).send(); return; }
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.sendFile(path.join(uploadConfig.root, filename), (error) => {
      if (error && !res.headersSent) res.status(404).send();
    });
  });
}
