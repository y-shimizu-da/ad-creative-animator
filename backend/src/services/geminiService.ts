import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

const TMP_DIR = path.join(process.cwd(), 'tmp');

let ai: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY が設定されていません');
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

export async function analyzeImageRegion(
  imageBase64: string,
  maskBase64: string
): Promise<string> {
  const client = getClient();

  // Remove data URL prefix if present
  const cleanImage = imageBase64.replace(/^data:image\/\w+;base64,/, '');
  const cleanMask = maskBase64.replace(/^data:image\/\w+;base64,/, '');

  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: { mimeType: 'image/png', data: cleanImage },
          },
          {
            inlineData: { mimeType: 'image/png', data: cleanMask },
          },
          {
            text: 'The first image is an advertisement creative. The second image is a mask where white regions indicate selected areas. Describe what is in the white/selected region of the first image in 1-2 concise sentences in English. Focus on what objects or elements are there.',
          },
        ],
      },
    ],
  });

  return response.text || 'the selected region';
}

export async function generateVideo(
  imagePath: string,
  enhancedPrompt: string,
  jobId: string
): Promise<string> {
  const client = getClient();
  const model = process.env.VEO_MODEL || 'veo-2.0-generate-001';

  const imageBytes = fs.readFileSync(imagePath);
  const imageBase64 = imageBytes.toString('base64');
  const mimeType = imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';

  console.log(`[Job ${jobId}] Calling Veo API with model: ${model}`);

  const operation = await client.models.generateVideos({
    model,
    prompt: enhancedPrompt,
    image: {
      imageBytes: imageBase64,
      mimeType,
    },
    config: {
      aspectRatio: '16:9',
      durationSeconds: 8,
    },
  });

  // Poll until done
  const maxAttempts = Number(process.env.VEO_MAX_POLL_ATTEMPTS) || 60;
  const interval = Number(process.env.VEO_POLL_INTERVAL_MS) || 10000;

  let result: any = operation;
  for (let i = 0; i < maxAttempts; i++) {
    if (result.done) break;

    console.log(`[Job ${jobId}] Polling attempt ${i + 1}/${maxAttempts}...`);
    await new Promise((resolve) => setTimeout(resolve, interval));

    if (result.name) {
      result = await client.operations.get({ operation: result.name });
    }
  }

  if (!result.done) {
    throw new Error('動画生成がタイムアウトしました');
  }

  // Extract video from response
  const response = result.response;
  if (
    !response ||
    !('generatedVideos' in response) ||
    !response.generatedVideos?.length
  ) {
    throw new Error('動画の生成結果が取得できませんでした');
  }

  const video = response.generatedVideos[0];
  if (!video.video?.uri) {
    throw new Error('動画URIが取得できませんでした');
  }

  // Download the video
  const videoUrl = video.video.uri;
  const videoRes = await fetch(videoUrl);
  if (!videoRes.ok) {
    throw new Error('動画のダウンロードに失敗しました');
  }

  const videoBuffer = Buffer.from(await videoRes.arrayBuffer());
  const outputPath = path.join(TMP_DIR, `${jobId}.mp4`);
  fs.writeFileSync(outputPath, videoBuffer);

  console.log(`[Job ${jobId}] Video saved to ${outputPath}`);
  return outputPath;
}
