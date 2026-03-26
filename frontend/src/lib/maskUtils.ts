import { Line } from '@/types';

export function exportMaskToBase64(
  lines: Line[],
  width: number,
  height: number
): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Black background (static regions)
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  for (const line of lines) {
    ctx.globalCompositeOperation = line.isEraser
      ? 'destination-out'
      : 'source-over';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = line.brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();

    for (let i = 0; i < line.points.length; i += 2) {
      const x = line.points[i];
      const y = line.points[i + 1];
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  }

  return canvas.toDataURL('image/png');
}
