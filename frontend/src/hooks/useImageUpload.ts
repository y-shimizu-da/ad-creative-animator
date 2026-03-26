'use client';

import { useCallback, useState } from 'react';

const MAX_SIZE_MB = 10;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export function useImageUpload() {
  const [error, setError] = useState<string | null>(null);

  const validate = useCallback((file: File): boolean => {
    setError(null);
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('PNG, JPEG, WebP のみ対応しています');
      return false;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`ファイルサイズは${MAX_SIZE_MB}MB以下にしてください`);
      return false;
    }
    return true;
  }, []);

  const readAsDataUrl = useCallback(
    (file: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => reject(new Error('ファイルの読み込みに失敗'));
        reader.readAsDataURL(file);
      }),
    []
  );

  return { validate, readAsDataUrl, error };
}
