import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { upload } from '../middleware/upload';
import { validateGenerateRequest } from '../middleware/validate';
import { buildEnhancedPrompt } from '../services/promptBuilder';
import { generateVideo } from '../services/geminiService';
import { Job } from '../types';

const router = Router();

// In-memory job store
export const jobs = new Map<string, Job>();

// Cleanup old jobs every 10 minutes
setInterval(() => {
  const maxAge = 30 * 60 * 1000; // 30 minutes
  const now = Date.now();
  for (const [id, job] of jobs) {
    if (now - job.createdAt > maxAge) {
      jobs.delete(id);
    }
  }
}, 10 * 60 * 1000);

router.post(
  '/',
  upload.single('image'),
  validateGenerateRequest,
  async (req: Request, res: Response): Promise<void> => {
    const jobId = uuidv4();
    const { mask, prompt } = req.body;
    const imagePath = req.file!.path;

    const job: Job = {
      id: jobId,
      status: 'queued',
      videoPath: null,
      error: null,
      createdAt: Date.now(),
    };
    jobs.set(jobId, job);

    res.json({ jobId, status: 'queued' });

    // Process in background
    (async () => {
      try {
        job.status = 'generating';

        // Build enhanced prompt using Gemini analysis
        const enhancedPrompt = await buildEnhancedPrompt(
          imagePath,
          mask,
          prompt
        );

        // Generate video with Veo
        const videoPath = await generateVideo(
          imagePath,
          enhancedPrompt,
          jobId
        );

        job.status = 'complete';
        job.videoPath = videoPath;
        console.log(`[Job ${jobId}] Complete`);
      } catch (err) {
        job.status = 'error';
        job.error =
          err instanceof Error ? err.message : '動画生成に失敗しました';
        console.error(`[Job ${jobId}] Error:`, err);
      }
    })();
  }
);

export default router;
