'use client';

interface Props {
  videoUrl: string;
  onReset: () => void;
}

export default function VideoPreview({ videoUrl, onReset }: Props) {
  return (
    <div className="space-y-4">
      <div className="bg-slate-900 rounded-lg p-4 flex justify-center">
        <video
          src={videoUrl}
          controls
          autoPlay
          loop
          className="max-w-full rounded-lg"
          style={{ maxHeight: '70vh' }}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onReset}
          className="px-4 py-2.5 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600"
        >
          最初からやり直す
        </button>
        <a
          href={videoUrl}
          download="animated-creative.mp4"
          className="flex-1 text-center px-4 py-2.5 rounded-lg bg-green-600 text-white font-medium hover:bg-green-500 transition-colors"
        >
          動画をダウンロード
        </a>
      </div>
    </div>
  );
}
