import { Request, Response, NextFunction } from 'express';

export function validateGenerateRequest(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.file) {
    res.status(400).json({ error: '画像ファイルが必要です' });
    return;
  }

  const { mask, prompt } = req.body;

  if (!mask || typeof mask !== 'string') {
    res.status(400).json({ error: 'マスクデータが必要です' });
    return;
  }

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    res.status(400).json({ error: 'プロンプトを入力してください' });
    return;
  }

  next();
}
