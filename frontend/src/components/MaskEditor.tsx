'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Image as KonvaImage, Line as KonvaLine } from 'react-konva';
import { useMaskDrawing } from '@/hooks/useMaskDrawing';
import { useVideoGeneration } from '@/hooks/useVideoGeneration';
import { exportMaskToBase64 } from '@/lib/maskUtils';
import BrushControls from './BrushControls';
import PromptInput from './PromptInput';
import type Konva from 'konva';

interface Props {
  imageFile: File;
  imageDataUrl: string;
  onVideoGenerated: (url: string) => void;
  onBack: () => void;
}

const MAX_CANVAS_WIDTH = 900;

export default function MaskEditor({
  imageFile,
  imageDataUrl,
  onVideoGenerated,
  onBack,
}: Props) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [prompt, setPrompt] = useState('');
  const stageRef = useRef<Konva.Stage>(null);

  const mask = useMaskDrawing();
  const { status, error, submit } = useVideoGeneration(onVideoGenerated);

  // Load image
  useEffect(() => {
    const img = new window.Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_CANVAS_WIDTH / img.width);
      setCanvasSize({
        width: Math.round(img.width * scale),
        height: Math.round(img.height * scale),
      });
      setImage(img);
    };
    img.src = imageDataUrl;
  }, [imageDataUrl]);

  const getPointerPosition = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return null;
    const pos = stage.getPointerPosition();
    return pos;
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!image || !prompt.trim() || !mask.hasMask) return;

    const scaleX = image.naturalWidth / canvasSize.width;
    const scaleY = image.naturalHeight / canvasSize.height;

    // Export mask at original image resolution
    const scaledLines = mask.lines.map((line) => ({
      ...line,
      points: line.points.map((p, i) => (i % 2 === 0 ? p * scaleX : p * scaleY)),
      brushSize: line.brushSize * Math.max(scaleX, scaleY),
    }));

    const maskBase64 = exportMaskToBase64(
      scaledLines,
      image.naturalWidth,
      image.naturalHeight
    );

    await submit(imageFile, maskBase64, prompt);
  }, [image, prompt, mask.hasMask, mask.lines, canvasSize, imageFile, submit]);

  if (!image) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        画像を読み込み中...
      </div>
    );
  }

  const isGenerating = status === 'uploading' || status === 'generating';

  return (
    <div className="space-y-4">
      <BrushControls
        brushSize={mask.brushSize}
        setBrushSize={mask.setBrushSize}
        isEraser={mask.isEraser}
        setIsEraser={mask.setIsEraser}
        onUndo={mask.undo}
        onClear={mask.clearAll}
        canUndo={mask.canUndo}
      />

      <p className="text-sm text-slate-400">
        アニメーションさせたい部分をブラシで塗ってください（赤色のエリア）
      </p>

      <div className="flex justify-center bg-slate-900 rounded-lg p-4 overflow-auto">
        <Stage
          ref={stageRef}
          width={canvasSize.width}
          height={canvasSize.height}
          onMouseDown={() => {
            const pos = getPointerPosition();
            if (pos) mask.handleMouseDown(pos);
          }}
          onMouseMove={() => {
            const pos = getPointerPosition();
            if (pos) mask.handleMouseMove(pos);
          }}
          onMouseUp={mask.handleMouseUp}
          onTouchStart={() => {
            const pos = getPointerPosition();
            if (pos) mask.handleMouseDown(pos);
          }}
          onTouchMove={() => {
            const pos = getPointerPosition();
            if (pos) mask.handleMouseMove(pos);
          }}
          onTouchEnd={mask.handleMouseUp}
          style={{ cursor: 'crosshair' }}
        >
          <Layer>
            <KonvaImage
              image={image}
              width={canvasSize.width}
              height={canvasSize.height}
            />
          </Layer>
          <Layer opacity={0.4}>
            {mask.lines.map((line, i) => (
              <KonvaLine
                key={i}
                points={line.points}
                stroke={line.isEraser ? '#000000' : '#ff0000'}
                strokeWidth={line.brushSize}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={
                  line.isEraser ? 'destination-out' : 'source-over'
                }
              />
            ))}
          </Layer>
        </Stage>
      </div>

      <PromptInput value={prompt} onChange={setPrompt} />

      {error && (
        <div className="bg-red-900/50 border border-red-700 rounded-lg px-4 py-3 text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          disabled={isGenerating}
          className="px-4 py-2.5 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-40"
        >
          戻る
        </button>
        <button
          onClick={handleGenerate}
          disabled={!mask.hasMask || !prompt.trim() || isGenerating}
          className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              {status === 'uploading' ? 'アップロード中...' : '動画生成中（1〜2分）...'}
            </span>
          ) : (
            '動画を生成'
          )}
        </button>
      </div>
    </div>
  );
}
