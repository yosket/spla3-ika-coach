# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

**Splatoon 3 AI コーチングサービス** (`spla3-ika-coach`) - スプラトゥーン3のバトルデータを分析し、日本語でAIコーチングアドバイスを提供するWebサービス。

## 現在の実装状況

プロジェクトは初期実装が完了し、基盤構築段階から Nintendo API連携フェーズに移行中。

**実装済み:**
- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Supabase認証システム (Magic Link)
- 基本的なページ構造とルーティング
- データベーススキーマ設計
- 認証ミドルウェアとRLS設定

## アーキテクチャ概要

### 技術スタック（実装版）
- **フロントエンド**: Next.js 14 (App Router)、TypeScript、Tailwind CSS、Noto Sans JP
- **認証**: Supabase Auth (Magic Link)
- **データベース**: Supabase PostgreSQL (無料枠)
- **サーバーレス関数**: Supabase Edge Functions
- **ホスティング**: Vercel Hobby ($0/月)
- **AI**: OpenAI GPT-3.5-turbo (予定)
- **データソース**: Nintendo SplatNet 3 API (nxapi経由)

### ディレクトリ構造
```
spla3-ika-coach/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── auth/         # 認証関連ページ
│   │   ├── dashboard/    # ダッシュボード
│   │   └── api/          # API Routes
│   ├── lib/              # ユーティリティ
│   │   └── supabase/     # Supabase関連
│   ├── types/            # TypeScript型定義
│   └── middleware.ts     # 認証ミドルウェア
├── supabase/
│   ├── migrations/       # データベーススキーマ
│   └── functions/        # Edge Functions
└── docs/                 # プロジェクトドキュメント
```

## 開発コマンド

### 基本開発
```bash
npm install                # 依存関係インストール
npm run dev               # 開発サーバー起動 (Turbopack使用)
npm run build             # プロダクションビルド
npm run start             # プロダクション起動
npm run lint              # ESLint実行
```

### データベース操作
```bash
# Supabaseプロジェクトセットアップ後に実行
supabase init             # ローカルSupabase初期化
supabase start            # ローカルSupabase起動
supabase db reset         # データベースリセット
supabase db push          # マイグレーション適用
```

## 重要な実装詳細

### 認証フロー
1. Magic Link認証（パスワード不要）
2. Supabase Auth使用
3. 認証ミドルウェアによる保護されたルート (`/dashboard`, `/battles`, `/analysis`)
4. Row Level Security (RLS) による データアクセス制御

### データフロー（計画）
1. ユーザーがNintendoセッショントークンを提供
2. Supabase Edge FunctionがnxapiでNintendo APIから50試合取得
3. バトルデータをJSONB形式でSupabase PostgreSQLに保存
4. 統計計算とGPT分析実行
5. 日本語コーチングアドバイス表示

### Supabase設定
- **クライアント**: `src/lib/supabase/client.ts` (ブラウザ用)
- **サーバー**: `src/lib/supabase/server.ts` (サーバーサイド用)
- **型定義**: `src/types/database.ts` (自動生成推奨)
- **ミドルウェア**: `src/lib/supabase/middleware.ts` (認証チェック)

### 環境変数（必須）
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## セキュリティ要件

- すべてのトークンは暗号化して保存
- Nintendo APIへは読み取り専用アクセス
- ユーザーデータのオンデマンド削除機能
- RLSによるマルチテナント分離
- セッション管理はSupabaseに委譲

## 実装時の重要事項

1. **言語**: すべてのユーザー向けコンテンツは日本語
2. **Nintendo API**: 非公式利用のリスク表示必須
3. **コスト最適化**: GPT-3.5-turbo + キャッシング戦略
4. **Vercel制限**: Hobby版は商用利用不可（本番時Pro移行）
5. **データベース**: Supabase無料枠（500MB制限）

## 次の開発フェーズ

### 優先度高（Phase 2）
1. Supabaseプロジェクト作成と環境変数設定
2. Nintendo OAuth2フロー実装
3. バトルデータ取得（Supabase Edge Function + nxapi）
4. トークン暗号化処理

### Phase 3-4
1. 統計計算エンジン（勝率、K/D、塗りポイント）
2. OpenAI統合とプロンプトエンジニアリング
3. ダッシュボードUI完成
4. AI分析結果表示

## 開発上の注意点

- Magic Link認証のため開発時もメール確認が必要
- Supabase Edge Functionsは月500,000実行まで無料
- GPT API使用量の監視とキャッシング実装必須
- Nintendo APIの非公式利用リスクをユーザーに明示

## Git規約

### コミットメッセージ規約
**Conventional Commits（日本語版）** を採用:
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント変更
- `style`: コードフォーマット（機能に影響しない変更）
- `refactor`: リファクタリング
- `test`: テスト追加・修正
- `chore`: ビルドプロセス・補助ツール変更

**Examples:**
```
feat: Magic Link認証を追加
fix: ミドルウェアのリダイレクトループを修正
docs: セットアップ手順を更新
feat(auth): Nintendo OAuth2フローを実装
```

### 重要な規約
- **コミットメッセージは日本語で記述**
- **Claude Code署名は含めない**（🤖 Generated with Claude Codeなどを追加しない）
- シンプルで分かりやすい説明を心がける