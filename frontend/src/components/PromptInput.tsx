'use client';

interface Props {
  value: string;
  onChange: (v: string) => void;
}

const suggestions = [
  '風になびかせて',
  'ゆっくり揺らして',
  '光を反射させて',
  'ふわっと浮遊させて',
  '水面のように波打たせて',
];

export default function PromptInput({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-300">
        アニメーションの指示
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="マスクした部分をどのように動かすか指示してください（例: 髪を風になびかせて）"
        className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
        rows={2}
      />
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button
            key={s}
            className="text-xs px-2.5 py-1 rounded-full bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white transition-colors"
            onClick={() => onChange(value ? `${value} ${s}` : s)}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
