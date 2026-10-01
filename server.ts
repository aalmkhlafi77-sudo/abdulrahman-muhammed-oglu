import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import authRouter from './server/routes/auth';
import playerRouter from './server/routes/player';
import { careerRoutes, clubRoutes } from './server/routes/coreContent';
import imageRoutes from './server/routes/images';
import { getUploadConfig, storedImageName } from './server/config/uploads';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use('/api/auth', authRouter);
app.use('/api/player', playerRouter);
app.use('/api', clubRoutes);
app.use('/api/career', careerRoutes);
app.use('/api', imageRoutes);

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

// Vite middleware for development & static serving for production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: Number(PORT) },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🚀 Portfolio Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
