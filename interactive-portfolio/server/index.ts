import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { router } from './router.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// Health
app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// API
app.use('/api', router);

// Static (dev/prod)
const rootDir = path.resolve(__dirname, '..');
let publicDir = path.join(rootDir, 'public');
if (!fs.existsSync(publicDir)) {
  // when running from dist/server
  publicDir = path.resolve(rootDir, '..', 'public');
}
app.use(express.static(publicDir));

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${port}`);
});
