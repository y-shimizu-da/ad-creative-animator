'use client';

import { AppStep } from '@/types';

interface Props {
  currentStep: AppStep;
}

const steps: { key: AppStep; label: string; num: number }[] = [
  { key: 'upload', label: '画像アップロード', num: 1 },
  { key: 'edit', label: 'マスク描画 & プロンプト', num: 2 },
  { key: 'generate', label: '動画プレビュー', num: 3 },
];

export default function StepIndicator({ currentStep }: Props) {
  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center justify-center gap-2 mb-4">
      {steps.map((s, i) => (
        <div key={s.key} className="flex items-center gap-2">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
              i <= currentIndex
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-400'
            }`}
          >
            <span className="font-bold">{s.num}</span>
            <span>{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-8 h-0.5 ${
                i < currentIndex ? 'bg-blue-600' : 'bg-slate-700'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
