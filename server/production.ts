import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { app } from '../server';
import { validateProductionEnvironment } from './config/production';

const __filename = fileURLToPath(import.meta.url);
const buildDirectory = path.dirname(__filename);
const clientDirectory = path.resolve(buildDirectory, '..', 'dist');
const port = Number(process.env.PORT || 3000);

validateProductionEnvironment(buildDirectory);

app.use(express.static(clientDirectory));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDirectory, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Portfolio production server running on http://0.0.0.0:${port}`);
});
