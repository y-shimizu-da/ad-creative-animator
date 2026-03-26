# Ad Creative Animator

広告クリエイティブ画像の特定部分をAIで動画化するWebツール。

## 機能

1. **画像アップロード** — 広告クリエイティブ（PNG/JPEG/WebP）をドラッグ&ドロップ
2. **マスク描画** — ブラシツールでアニメーションさせたい領域を塗る
3. **プロンプト指示** — 「風になびかせて」「ゆっくり揺らして」等、動きをテキストで指示
4. **AI動画生成** — Google Gemini API (Veo 2) が指定領域だけをアニメーション化した動画を生成

## 技術スタック

| レイヤー | 技術 |
|----------|------|
| Frontend | Next.js, React, TypeScript, Tailwind CSS, react-konva |
| Backend  | Node.js, Express, TypeScript |
| AI       | Google Gemini API (`@google/genai` SDK) — Veo 2 + Gemini Flash |

## セットアップ

### 前提条件

- Node.js 18+
- Google Gemini API キー（[Google AI Studio](https://aistudio.google.com/) で取得）

### インストール

```bash
git clone https://github.com/your-username/ad-creative-animator.git
cd ad-creative-animator
npm install
```

### 環境変数

```bash
# backend/.env を作成
cp .env.example backend/.env
# エディタで GEMINI_API_KEY を設定

# frontend/.env.local を作成
cp frontend/.env.local.example frontend/.env.local
```

### 起動

```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## 使い方

1. ブラウザで http://localhost:3000 を開く
2. 広告クリエイティブ画像をアップロード
3. ブラシツールで動かしたい部分を赤く塗る
4. プロンプト欄に動きの指示を入力
5. 「動画を生成」をクリック（1〜2分かかります）
6. 生成された動画をプレビュー・ダウンロード

## 仕組み

マスク領域の解析にはGemini Flashを使用し、「どの部分が選択されているか」を自然言語で特定します。その結果とユーザーのプロンプトを組み合わせて、Veo 2に「指定部分だけ動かし、他は静止」という強化プロンプトを送信します。

```
ユーザー入力:
  画像 + マスク + 「髪を風になびかせて」

Gemini Flash 解析:
  「マスク領域は女性の髪の部分です」

Veo 2 へのプロンプト:
  「Animate the woman's hair: 髪を風になびかせて.
   Keep ALL other parts completely static. No camera movement.」
```

## プロジェクト構成

```
ad-creative-animator/
├── frontend/          # Next.js フロントエンド
│   └── src/
│       ├── app/       # ページ・レイアウト
│       ├── components/# UI コンポーネント
│       ├── hooks/     # カスタムフック
│       └── lib/       # ユーティリティ
├── backend/           # Express バックエンド
│   └── src/
│       ├── routes/    # API エンドポイント
│       ├── services/  # Gemini API 統合
│       └── middleware/ # バリデーション等
```

## ライセンス

MIT
