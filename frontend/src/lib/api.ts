const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function getVideoUrl(jobId: string): string {
  return `${API_URL}/api/video/${jobId}`;
}
