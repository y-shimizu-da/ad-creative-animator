import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('[Error]', err.message);

  if (err.message.includes('のみ対応')) {
    res.status(400).json({ error: err.message });
    return;
  }

  if (err.message.includes('File too large')) {
    res.status(413).json({ error: 'ファイルサイズが大きすぎます（最大10MB）' });
    return;
  }

  res.status(500).json({ error: 'サーバー内部エラーが発生しました' });
}
