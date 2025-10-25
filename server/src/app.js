import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './routes/index.js';

dotenv.config();
// Fallbacks for .env encoding issues on Windows
if (!process.env.MONGODB_URI || !process.env.CLIENT_URL || !process.env.PORT) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    // Try utf16le
    if (!process.env.MONGODB_URI) dotenv.config({ path: envPath, encoding: 'utf16le', override: true });
    // Manual parse if still missing
    if (!process.env.MONGODB_URI) {
      try {
        const buf = fs.readFileSync(envPath);
        const tryParse = (text) => {
          text.split(/\r?\n/).forEach((l) => {
            const idx = l.indexOf('=');
            if (idx > 0) {
              const k = l.slice(0, idx).trim();
              const v = l.slice(idx + 1).trim();
              if (k && v && !process.env[k]) process.env[k] = v;
            }
          });
        };
        tryParse(buf.toString('utf8'));
        if (!process.env.MONGODB_URI) tryParse(buf.toString('utf16le'));
      } catch {}
    }
  }
}

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', apiRouter);

export default app;
