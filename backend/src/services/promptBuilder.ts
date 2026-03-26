import { analyzeImageRegion } from './geminiService';
import fs from 'fs';

export async function buildEnhancedPrompt(
  imagePath: string,
  maskBase64: string,
  userPrompt: string
): Promise<string> {
  // Read image and convert to base64
  const imageBytes = fs.readFileSync(imagePath);
  const imageBase64 = imageBytes.toString('base64');

  // Use Gemini to analyze what's in the masked region
  let regionDescription: string;
  try {
    regionDescription = await analyzeImageRegion(imageBase64, maskBase64);
    console.log(`[PromptBuilder] Detected region: ${regionDescription}`);
  } catch (err) {
    console.warn('[PromptBuilder] Region analysis failed, using generic prompt');
    regionDescription = 'the selected region';
  }

  // Build enhanced prompt that instructs Veo to animate only the masked region
  const enhancedPrompt = [
    `Generate a smooth, high-quality video from this image.`,
    `Animate ${regionDescription}: ${userPrompt}.`,
    `IMPORTANT: Keep ALL other parts of the image completely static and unchanged.`,
    `No camera movement, no zoom, no pan. Only the specified region should move.`,
    `The animation should be natural, smooth, and seamless for looping.`,
  ].join(' ');

  console.log(`[PromptBuilder] Enhanced prompt: ${enhancedPrompt}`);
  return enhancedPrompt;
}
