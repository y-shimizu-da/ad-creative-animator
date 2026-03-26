import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ad Creative Animator',
  description: 'Animate specific regions of ad creatives using AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen">
        <header className="border-b border-slate-700 px-6 py-4">
          <h1 className="text-xl font-bold text-white">
            Ad Creative Animator
          </h1>
          <p className="text-sm text-slate-400">
            広告クリエイティブの特定部分をAIで動画化
          </p>
        </header>
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          {children}
        </main>
      </body>
    </html>
  );
}
