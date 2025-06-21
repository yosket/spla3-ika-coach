# Splatoon 3 AI コーチングサービス実装計画（改訂版）

**作成日:** 2025-06-21  
**プロジェクト名:** spla3-ika-coach  
**重要:** コスト最適化を重視した実装

## 1. 技術スタック（改訂版）

### フロントエンド
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **NextAuth.js** (Supabase連携)
- **Tanstack Query** (React Query後継)
- **Recharts** (軽量グラフライブラリ)

### バックエンド
- **Next.js API Routes** (FastAPI不要に)
- **Supabase** (PostgreSQL + Auth + Realtime)
- **Upstash Redis** (セッションキャッシュ)
- **OpenAI API** (GPT-3.5-turbo中心)

### インフラ
- **Vercel** (Hobbyプラン → 後でProへ)
- **Netlify Functions** (バトルインポート用)
- **環境変数管理**: Vercel環境変数

## 2. 簡略化されたディレクトリ構造

```
spla3-ika-coach/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # UIコンポーネント
│   ├── lib/             # ユーティリティ
│   ├── hooks/           # カスタムフック
│   └── types/           # TypeScript型定義
├── public/              # 静的アセット
├── supabase/            # Supabaseマイグレーション
├── netlify/
│   └── functions/       # Netlifyサーバーレス関数
├── docs/                # ドキュメント
└── package.json
```

## 3. 改訂版実装フェーズ

### Phase 1: MVP基盤（Day 1-3）

#### Day 1: プロジェクトセットアップ
- [ ] Next.js 14プロジェクト作成
- [ ] Supabaseプロジェクト作成
- [ ] 基本的な環境設定
- [ ] Tailwind CSS設定

#### Day 2: 認証システム
- [ ] Supabase Auth設定
- [ ] Magic Link認証実装
- [ ] 認証フロー作成
- [ ] プロテクトルート設定

#### Day 3: データベース設計
- [ ] Supabaseテーブル作成
- [ ] Row Level Security設定
- [ ] 基本的なCRUD API
- [ ] 型定義生成

### Phase 2: Nintendo連携（Day 4-6）

#### Day 4: トークン管理
- [ ] Nintendoトークン取得UI
- [ ] クライアントサイド暗号化
- [ ] Supabaseへの安全な保存
- [ ] トークン有効期限管理

#### Day 5-6: データ取得
- [ ] Netlify Function作成
- [ ] nxapi統合
- [ ] バトルデータ取得
- [ ] Supabaseへのデータ保存

### Phase 3: 分析機能（Day 7-9）

#### Day 7: 統計計算
- [ ] 基本統計（勝率、K/D）
- [ ] ブキ別集計
- [ ] ルール別集計
- [ ] データ可視化

#### Day 8: UI実装
- [ ] ダッシュボード
- [ ] 統計表示
- [ ] フィルター機能
- [ ] レスポンシブ対応

#### Day 9: 詳細表示
- [ ] 個別試合ビュー
- [ ] チーム構成分析
- [ ] パフォーマンス推移

### Phase 4: AI機能（Day 10-12）

#### Day 10: AI統合
- [ ] OpenAI API設定
- [ ] プロンプト最適化
- [ ] GPT-3.5-turbo実装
- [ ] レスポンスキャッシュ

#### Day 11: 高度な分析
- [ ] 選択的GPT-4o使用
- [ ] 分析結果の保存
- [ ] 過去の分析履歴

#### Day 12: 最終調整
- [ ] エラーハンドリング
- [ ] パフォーマンス最適化
- [ ] セキュリティ確認
- [ ] デプロイ準備

## 4. コスト削減のための実装詳細

### 4.1 データベース設計（Supabase）
```sql
-- ユーザー
create table users (
  id uuid references auth.users primary key,
  username text unique,
  created_at timestamp default now()
);

-- 暗号化トークン（クライアントサイド暗号化）
create table encrypted_tokens (
  user_id uuid references users(id) primary key,
  encrypted_data text not null,
  expires_at timestamp not null,
  created_at timestamp default now()
);

-- バトルデータ（JSONB for flexibility）
create table battles (
  id text primary key,
  user_id uuid references users(id),
  battle_data jsonb not null,
  played_at timestamp not null,
  created_at timestamp default now()
);

-- AI分析結果（キャッシュ用）
create table ai_analyses (
  id uuid primary key default gen_random_uuid(),
  battle_id text references battles(id),
  analysis_type text not null,
  result jsonb not null,
  model_used text not null,
  created_at timestamp default now()
);

-- RLS設定
alter table users enable row level security;
alter table encrypted_tokens enable row level security;
alter table battles enable row level security;
alter table ai_analyses enable row level security;
```

### 4.2 AI使用量最適化
```typescript
// GPT使用戦略
const getAIModel = (analysisType: string, userTier: string) => {
  if (userTier === 'free' || analysisType === 'basic') {
    return 'gpt-3.5-turbo';
  }
  return 'gpt-4o-mini'; // GPT-4oより安価
};

// キャッシュ戦略
const getCachedAnalysis = async (battleId: string, type: string) => {
  // 24時間以内の分析結果を再利用
  const cached = await supabase
    .from('ai_analyses')
    .select('*')
    .eq('battle_id', battleId)
    .eq('analysis_type', type)
    .gte('created_at', new Date(Date.now() - 24*60*60*1000).toISOString())
    .single();
  
  return cached.data;
};
```

### 4.3 セキュリティ（コスト削減版）
```typescript
// クライアントサイド暗号化
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const encryptToken = (token: string, userKey: string) => {
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-gcm', userKey, iv);
  // 実装詳細...
};

// Supabase RLSポリシー
// ユーザーは自分のデータのみアクセス可能
```

## 5. 環境変数（簡略化）

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_KEY=xxx
OPENAI_API_KEY=xxx
UPSTASH_REDIS_URL=xxx
UPSTASH_REDIS_TOKEN=xxx
```

## 6. デプロイ戦略

### 初期（無料/低コスト）
1. **Vercel Hobby**: フロントエンド
2. **Supabase Free**: DB/Auth
3. **Netlify Functions Free**: バックエンド処理
4. **Upstash Free**: Redis

### スケール時
1. **Vercel Pro**: $20/月
2. **Supabase Pro**: $25/月
3. **専用Redis**: 必要に応じて

## 7. 主な変更点まとめ

1. **FastAPI削除** → Next.js API Routesで統一
2. **AWS削減** → Supabase/Vercel中心
3. **Docker不要** → ローカル開発簡略化
4. **GPT-3.5中心** → コスト90%削減
5. **無料枠最大活用** → 初期費用ほぼゼロ

## 8. 開発開始コマンド

```bash
# プロジェクト作成
npx create-next-app@latest spla3-ika-coach --typescript --tailwind --app

# 依存関係インストール
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install @tanstack/react-query recharts
npm install @upstash/redis @upstash/ratelimit

# 開発開始
npm run dev
```

この改訂版では初期コストを月額$25程度に抑えつつ、必要に応じてスケールアップ可能な構成にしています。