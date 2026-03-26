export interface Job {
  id: string;
  status: 'queued' | 'generating' | 'complete' | 'error';
  videoPath: string | null;
  error: string | null;
  createdAt: number;
}

export interface GenerateBody {
  mask: string;
  prompt: string;
}
