import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import generateRouter from './routes/generate';
import statusRouter from './routes/status';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Ensure tmp directory exists
const tmpDir = path.join(process.cwd(), 'tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

// Middleware
app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ['GET', 'POST'],
  })
);
app.use(express.json({ limit: '20mb' }));

// Routes
app.use('/api/generate', generateRouter);
app.use('/api/status', statusRouter);

// Video route (handled in status router but mounted separately for clean URL)
app.get('/api/video/:jobId', (req, res) => {
  // Delegated to status router
  const { jobId } = req.params;
  const { jobs } = require('./routes/generate');
  const job = jobs.get(jobId);

  if (!job || !job.videoPath) {
    res.status(404).json({ error: '動画が見つかりません' });
    return;
  }

  if (!fs.existsSync(job.videoPath)) {
    res.status(404).json({ error: '動画ファイルが存在しません' });
    return;
  }

  res.setHeader('Content-Type', 'video/mp4');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="animated-creative-${jobId}.mp4"`
  );
  fs.createReadStream(job.videoPath).pipe(res);
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`Accepting requests from: ${FRONTEND_URL}`);
});
