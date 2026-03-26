export interface Line {
  points: number[];
  brushSize: number;
  isEraser: boolean;
}

export type AppStep = 'upload' | 'edit' | 'generate';

export type JobStatus = 'idle' | 'uploading' | 'generating' | 'complete' | 'error';

export interface JobResult {
  jobId: string;
  status: JobStatus;
  videoUrl: string | null;
  error: string | null;
}

export interface GenerateRequest {
  image: File;
  mask: string;
  prompt: string;
}
