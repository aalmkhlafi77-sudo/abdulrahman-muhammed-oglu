import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import authRouter from './server/routes/auth';
import playerRouter from './server/routes/player';
import { careerRoutes, clubRoutes } from './server/routes/coreContent';
import imageRoutes from './server/routes/images';
import { db } from './server/config/database';
import { getUploadConfig, storedImageName } from './server/config/uploads';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

app.use(express.json({ limit: '50mb' }));
app.use('/api/auth', authRouter);
app.use('/api/player', playerRouter);
app.use('/api', clubRoutes);
app.use('/api/career', careerRoutes);
app.use('/api', imageRoutes);

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

// File-backed persistence storage directory
const DATA_DIR = path.join(__dirname, 'data_store');
const DB_FILE = path.join(DATA_DIR, 'portfolio_data.json');

// Ensure data_store directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// API Routes for Global Cross-Device & Cross-Browser Data Persistence
app.get('/api/data', (req, res) => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return res.json(JSON.parse(content));
    }
    return res.json({ status: 'no_server_data' });
  } catch (err) {
    console.error('[Server Data API] Error reading server data:', err);
    return res.status(500).json({ error: 'Failed to read server data' });
  }
});

app.post('/api/data', (req, res) => {
  try {
    const data = req.body;
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Invalid data payload' });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return res.json({ success: true, savedAt: new Date().toISOString() });
  } catch (err) {
    console.error('[Server Data API] Error saving server data:', err);
    return res.status(500).json({ error: 'Failed to save server data' });
  }
});
