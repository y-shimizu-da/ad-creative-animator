'use client';

interface Props {
  brushSize: number;
  setBrushSize: (size: number) => void;
  isEraser: boolean;
  setIsEraser: (v: boolean) => void;
  onUndo: () => void;
  onClear: () => void;
  canUndo: boolean;
}

export default function BrushControls({
  brushSize,
  setBrushSize,
  isEraser,
  setIsEraser,
  onUndo,
  onClear,
  canUndo,
}: Props) {
  return (
    <div className="flex items-center gap-4 flex-wrap bg-slate-800 rounded-lg px-4 py-3">
      <div className="flex items-center gap-2">
        <button
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            !isEraser ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
          onClick={() => setIsEraser(false)}
        >
          ブラシ
        </button>
        <button
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            isEraser ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
          onClick={() => setIsEraser(true)}
        >
          消しゴム
        </button>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm text-slate-400">サイズ</label>
        <input
          type="range"
          min={5}
          max={100}
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="w-28 accent-blue-500"
        />
        <span className="text-sm text-slate-400 w-8">{brushSize}</span>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <button
          className="px-3 py-1.5 rounded text-sm bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={onUndo}
          disabled={!canUndo}
        >
          元に戻す
        </button>
        <button
          className="px-3 py-1.5 rounded text-sm bg-slate-700 text-slate-300 hover:bg-slate-600"
          onClick={onClear}
        >
          全消去
        </button>
      </div>
    </div>
  );
}
