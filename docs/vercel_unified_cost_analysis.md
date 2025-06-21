# Vercel統一構成のコスト分析

## 現在の提案（Vercel + Netlify）
- **Vercel Hobby**: $0/月（フロントエンド）
- **Netlify Functions**: $0/月（バックエンド処理）
- **合計**: $0/月

## Vercel統一構成

### Option 1: Vercel Hobby（無料プラン）
**含まれるもの**:
- 100GB帯域幅/月
- Vercel Functions: 100GB-hours/月
- 実行時間: 10秒/関数
- 同時実行: 1,000
- **制限**: 商用利用不可、カスタムドメイン制限

**問題点**:
- nxapi統合のバトルインポート処理が10秒制限に収まらない可能性
- 商用利用の場合は規約違反

### Option 2: Vercel Pro（$20/月）
**含まれるもの**:
- 1TB帯域幅/月
- Vercel Functions: 1,000GB-hours/月
- 実行時間: 60秒/関数（十分）
- Edge Functions無制限
- カスタムドメイン
- 商用利用OK

### Option 3: 代替構成の検討

#### A. Vercel + Supabase Edge Functions
- **Vercel Hobby/Pro**: $0-20/月
- **Supabase Edge Functions**: 無料枠で500,000実行/月
- バトルインポートをSupabase側で処理

#### B. 全てNext.js API Routes内で処理
- **Vercel Pro**: $20/月必須（実行時間制限のため）
- シンプルな構成
- デプロイが簡単

## コスト比較表

| 構成 | 月額 | メリット | デメリット |
|------|------|----------|------------|
| Vercel + Netlify | $0 | 完全無料可能 | 2サービス管理 |
| Vercel Hobby | $0 | 統一管理 | 商用利用不可、10秒制限 |
| Vercel Pro | $20 | 統一管理、制限なし | 有料 |
| Vercel + Supabase Functions | $0-20 | 柔軟性高い | Supabase依存増 |

## 実装の観点からの比較

### バトルインポート処理の所要時間（推定）
```
1. Nintendo API認証: 1-2秒
2. 50試合データ取得: 3-5秒
3. データ処理・保存: 2-3秒
合計: 6-10秒
```

**結論**: Vercel Hobbyの10秒制限はギリギリ

### 推奨構成

#### 開発・プロトタイプ段階
```
Vercel Hobby + Supabase Edge Functions
- コスト: $0/月
- バトルインポートはSupabase Edge Functionsで処理
- UIとAPIはVercelで統一
```

#### 本番・商用利用
```
Vercel Pro単独
- コスト: $20/月
- 全てVercel Functions内で処理
- シンプルな運用
- 60秒の実行時間で余裕
```

## 実装方法（Vercel統一の場合）

### ディレクトリ構造
```
spla3-ika-coach/
├── app/
│   ├── api/
│   │   ├── auth/         # 認証エンドポイント
│   │   ├── battles/      # バトルデータ取得
│   │   ├── analysis/     # AI分析
│   │   └── cron/         # 定期実行（Vercel Cron）
│   └── ...               # UIページ
├── lib/
│   ├── nintendo/         # Nintendo API統合
│   ├── ai/              # OpenAI統合
│   └── db/              # Supabase統合
└── ...
```

### Vercel設定（vercel.json）
```json
{
  "functions": {
    "app/api/battles/import.ts": {
      "maxDuration": 60  // Pro版のみ
    }
  },
  "crons": [{
    "path": "/api/cron/cleanup",
    "schedule": "0 0 * * *"  // 毎日実行
  }]
}
```

## 最終推奨

1. **開始時**: Vercel Hobby + Supabase Edge Functions（$0/月）
   - 無料で開始
   - 必要十分な機能

2. **成長時**: Vercel Pro単独（$20/月）
   - 管理の簡素化
   - パフォーマンス向上
   - 商用利用対応

Netlifyを使わずにVercelに統一しても、Supabase Edge Functionsを組み合わせることで初期コストは$0に抑えられます。