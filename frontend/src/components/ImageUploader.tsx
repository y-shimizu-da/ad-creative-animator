'use client';

import { useCallback, useRef, useState } from 'react';

interface Props {
  onUpload: (file: File, dataUrl: string) => void;
}

const MAX_SIZE_MB = 10;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export default function ImageUploader({ onUpload }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndUpload = useCallback(
    (file: File) => {
      setError(null);
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError('PNG, JPEG, WebP のみ対応しています');
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`ファイルサイズは${MAX_SIZE_MB}MB以下にしてください`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        onUpload(file, e.target?.result as string);
      };
      reader.readAsDataURL(file);
    },
    [onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) validateAndUpload(file);
    },
    [validateAndUpload]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) validateAndUpload(file);
    },
    [validateAndUpload]
  );

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-16 text-center cursor-pointer transition-colors ${
        isDragging
          ? 'border-blue-400 bg-blue-400/10'
          : 'border-slate-600 hover:border-slate-400'
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="space-y-4">
        <div className="text-5xl">🖼️</div>
        <p className="text-lg text-slate-300">
          広告クリエイティブ画像をドラッグ&ドロップ
        </p>
        <p className="text-sm text-slate-500">
          またはクリックしてファイルを選択（PNG, JPEG, WebP / 最大{MAX_SIZE_MB}MB）
        </p>
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>
    </div>
  );
}
