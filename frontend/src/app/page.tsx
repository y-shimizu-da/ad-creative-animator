'use client';

import { useState, useCallback } from 'react';
import { AppStep } from '@/types';
import ImageUploader from '@/components/ImageUploader';
import dynamic from 'next/dynamic';

const MaskEditor = dynamic(() => import('@/components/MaskEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64 text-slate-400">
      エディタを読み込み中...
    </div>
  ),
});
import StepIndicator from '@/components/StepIndicator';
import VideoPreview from '@/components/VideoPreview';

export default function Home() {
  const [step, setStep] = useState<AppStep>('upload');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const handleImageUpload = useCallback((file: File, dataUrl: string) => {
    setImageFile(file);
    setImageDataUrl(dataUrl);
    setStep('edit');
    setVideoUrl(null);
  }, []);

  const handleVideoGenerated = useCallback((url: string) => {
    setVideoUrl(url);
    setStep('generate');
  }, []);

  const handleReset = useCallback(() => {
    setStep('upload');
    setImageFile(null);
    setImageDataUrl(null);
    setVideoUrl(null);
  }, []);

  return (
    <div className="space-y-6">
      <StepIndicator currentStep={step} />

      {step === 'upload' && (
        <ImageUploader onUpload={handleImageUpload} />
      )}

      {step === 'edit' && imageFile && imageDataUrl && (
        <MaskEditor
          imageFile={imageFile}
          imageDataUrl={imageDataUrl}
          onVideoGenerated={handleVideoGenerated}
          onBack={handleReset}
        />
      )}

      {step === 'generate' && videoUrl && (
        <VideoPreview
          videoUrl={videoUrl}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
