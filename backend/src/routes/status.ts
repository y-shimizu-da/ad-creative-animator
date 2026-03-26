import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { jobs } from './generate';

const router = Router();

// GET /api/status/:jobId
router.get('/:jobId', (req: Request, res: Response): void => {
  const jobId = req.params.jobId as string;
  const job = jobs.get(jobId);

  if (!job) {
    res.status(404).json({ error: 'ジョブが見つかりません' });
    return;
  }

  const baseUrl = `${req.protocol}://${req.get('host')}`;

  res.json({
    jobId: job.id,
    status: job.status,
    videoUrl:
      job.status === 'complete' && job.videoPath
        ? `${baseUrl}/api/video/${job.id}`
        : null,
    error: job.error,
  });
});

// GET /api/video/:jobId
router.get(
  '/video/:jobId',
  (req: Request, res: Response): void => {
    const jobId = req.params.jobId as string;
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
  }
);

export default router;
