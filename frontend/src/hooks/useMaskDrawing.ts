'use client';

import { useState, useCallback, useRef } from 'react';
import { Line } from '@/types';

export function useMaskDrawing() {
  const [lines, setLines] = useState<Line[]>([]);
  const [brushSize, setBrushSize] = useState(30);
  const [isEraser, setIsEraser] = useState(false);
  const [history, setHistory] = useState<Line[][]>([]);
  const isDrawing = useRef(false);

  const handleMouseDown = useCallback(
    (pos: { x: number; y: number }) => {
      isDrawing.current = true;
      setHistory((prev) => [...prev, lines]);
      setLines((prev) => [
        ...prev,
        { points: [pos.x, pos.y], brushSize, isEraser },
      ]);
    },
    [lines, brushSize, isEraser]
  );

  const handleMouseMove = useCallback(
    (pos: { x: number; y: number }) => {
      if (!isDrawing.current) return;
      setLines((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        updated[updated.length - 1] = {
          ...last,
          points: [...last.points, pos.x, pos.y],
        };
        return updated;
      });
    },
    []
  );

  const handleMouseUp = useCallback(() => {
    isDrawing.current = false;
  }, []);

  const undo = useCallback(() => {
    if (history.length === 0) return;
    setLines(history[history.length - 1]);
    setHistory((prev) => prev.slice(0, -1));
  }, [history]);

  const clearAll = useCallback(() => {
    if (lines.length === 0) return;
    setHistory((prev) => [...prev, lines]);
    setLines([]);
  }, [lines]);

  const hasMask = lines.some((l) => !l.isEraser);

  return {
    lines,
    brushSize,
    setBrushSize,
    isEraser,
    setIsEraser,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    undo,
    clearAll,
    hasMask,
    canUndo: history.length > 0,
  };
}
