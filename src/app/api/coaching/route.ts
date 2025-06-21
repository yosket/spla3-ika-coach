import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface BattleAnalysis {
  totalBattles: number
  winRate: number
  avgKills: number
  avgDeaths: number
  avgAssists: number
  avgPaintPoints: number
  mostPlayedMode: string
  mostUsedWeapon: string
  recentPerformance: {
    wins: number
    losses: number
    kdRatio: number
  }
  weaknesses: string[]
  strengths: string[]
}

// バトルデータから統計を分析する関数
function analyzeUserPerformance(battles: any[]): BattleAnalysis {
  if (battles.length === 0) {
    return {
      totalBattles: 0,
      winRate: 0,
      avgKills: 0,
      avgDeaths: 0,
      avgAssists: 0,
      avgPaintPoints: 0,
      mostPlayedMode: '',
      mostUsedWeapon: '',
      recentPerformance: { wins: 0, losses: 0, kdRatio: 0 },
      weaknesses: [],
      strengths: []
    }
  }

  const wins = battles.filter(b => b.battle_data.result === 'win').length
  const winRate = (wins / battles.length) * 100
  
  const totalKills = battles.reduce((sum, b) => sum + (b.battle_data.kills || 0), 0)
  const totalDeaths = battles.reduce((sum, b) => sum + (b.battle_data.deaths || 0), 0)
  const totalAssists = battles.reduce((sum, b) => sum + (b.battle_data.assists || 0), 0)
  const totalPaint = battles.reduce((sum, b) => sum + (b.battle_data.paint_point || 0), 0)

  // モード別集計
  const modeCount: Record<string, number> = {}
  battles.forEach(b => {
    const mode = b.battle_data.mode || 'Unknown'
    modeCount[mode] = (modeCount[mode] || 0) + 1
  })
  const mostPlayedMode = Object.entries(modeCount).sort(([,a], [,b]) => b - a)[0]?.[0] || ''

  // ブキ別集計
  const weaponCount: Record<string, number> = {}
  battles.forEach(b => {
    const weapon = b.battle_data.weapon || 'Unknown'
    weaponCount[weapon] = (weaponCount[weapon] || 0) + 1
  })
  const mostUsedWeapon = Object.entries(weaponCount).sort(([,a], [,b]) => b - a)[0]?.[0] || ''

  // 直近10戦の成績
  const recentBattles = battles.slice(0, 10)
  const recentWins = recentBattles.filter(b => b.battle_data.result === 'win').length
  const recentLosses = recentBattles.length - recentWins
  const recentKills = recentBattles.reduce((sum, b) => sum + (b.battle_data.kills || 0), 0)
  const recentDeaths = recentBattles.reduce((sum, b) => sum + (b.battle_data.deaths || 0), 0)

  // 弱点と強みの分析
  const weaknesses: string[] = []
  const strengths: string[] = []

  if (winRate < 45) weaknesses.push('勝率が低い')
  if (totalKills / battles.length < 6) weaknesses.push('キル数が少ない')
  if (totalDeaths / battles.length > 8) weaknesses.push('デス数が多い')
  if (totalPaint / battles.length < 800) weaknesses.push('塗りポイントが低い')

  if (winRate > 60) strengths.push('高い勝率')
  if (totalKills / battles.length > 10) strengths.push('優秀なキル数')
  if (totalDeaths / battles.length < 5) strengths.push('デス数の少なさ')
  if (totalPaint / battles.length > 1200) strengths.push('高い塗りポイント')

  return {
    totalBattles: battles.length,
    winRate,
    avgKills: totalKills / battles.length,
    avgDeaths: totalDeaths / battles.length,
    avgAssists: totalAssists / battles.length,
    avgPaintPoints: totalPaint / battles.length,
    mostPlayedMode,
    mostUsedWeapon,
    recentPerformance: {
      wins: recentWins,
      losses: recentLosses,
      kdRatio: recentDeaths > 0 ? recentKills / recentDeaths : recentKills
    },
    weaknesses,
    strengths
  }
}

// OpenAI GPT-4oでコーチングアドバイスを生成
async function generateCoachingAdvice(analysis: BattleAnalysis): Promise<string> {
  const prompt = `
あなたはスプラトゥーン3の経験豊富なプロコーチです。以下のプレイヤーの戦績データを分析し、具体的で実践的な改善アドバイスを日本語で提供してください。

**プレイヤーの戦績データ:**
- 総バトル数: ${analysis.totalBattles}戦
- 勝率: ${analysis.winRate.toFixed(1)}%
- 平均キル数: ${analysis.avgKills.toFixed(1)}
- 平均デス数: ${analysis.avgDeaths.toFixed(1)}
- 平均アシスト数: ${analysis.avgAssists.toFixed(1)}
- 平均塗りポイント: ${analysis.avgPaintPoints.toFixed(0)}
- 最もプレイしたモード: ${analysis.mostPlayedMode}
- 最も使用したブキ: ${analysis.mostUsedWeapon}
- 直近10戦: ${analysis.recentPerformance.wins}勝${analysis.recentPerformance.losses}敗 (K/D比: ${analysis.recentPerformance.kdRatio.toFixed(2)})

**分析された弱点:** ${analysis.weaknesses.join(', ') || 'なし'}
**分析された強み:** ${analysis.strengths.join(', ') || 'なし'}

**コーチングアドバイスの要件:**
1. 最も重要な改善点を3つまでに絞る
2. 各改善点に対して具体的な練習方法を提示
3. 期待される効果と達成可能な目標を明記
4. プレイヤーのレベルに適した実践的なアドバイス
5. モチベーションを保つためのポジティブな表現

アドバイスは以下の形式で回答してください：

## 📊 戦績分析結果

[プレイヤーの現在の実力を簡潔に評価]

## 🎯 重点改善ポイント

### 1. [改善点1のタイトル]
**現状:** [具体的な問題点]
**練習方法:** [具体的な練習内容]
**期待効果:** [改善後の期待される結果]

### 2. [改善点2のタイトル]
**現状:** [具体的な問題点]
**練習方法:** [具体的な練習内容]
**期待効果:** [改善後の期待される結果]

### 3. [改善点3のタイトル]
**現状:** [具体的な問題点]
**練習方法:** [具体的な練習内容]
**期待効果:** [改善後の期待される結果]

## 💪 あなたの強み

[プレイヤーの優秀な点を評価し、それを活かす方法を提案]

## 🚀 次のステップ

[今後1-2週間で取り組むべき具体的な行動計画]

`;

  try {
    console.log('Generating coaching advice with OpenAI GPT-4o...')
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "あなたはスプラトゥーン3の専門コーチです。プレイヤーの戦績データを分析し、具体的で実践的な改善アドバイスを提供します。常に建設的で励ましのあるトーンで回答してください。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    })

    return completion.choices[0]?.message?.content || 'アドバイスの生成に失敗しました。'
    
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw new Error('AIコーチングアドバイスの生成に失敗しました')
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== AI Coaching Analysis Request Started ===')
    
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        error: 'OpenAI APIキーが設定されていません' 
      }, { status: 500 })
    }

    const supabase = await createClient()
    
    // ユーザー認証確認
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    // ユーザーのバトルデータを取得
    const { data: battles, error: battlesError } = await supabase
      .from('battles')
      .select('*')
      .eq('user_id', user.id)
      .order('played_at', { ascending: false })

    if (battlesError) {
      console.error('Database query error:', battlesError)
      return NextResponse.json({ 
        error: 'バトルデータの取得に失敗しました' 
      }, { status: 500 })
    }

    if (!battles || battles.length === 0) {
      return NextResponse.json({ 
        error: 'バトルデータが見つかりません。まずバトルデータを取得してください。' 
      }, { status: 400 })
    }

    console.log(`Analyzing ${battles.length} battles for user ${user.id}`)

    // バトルデータを分析
    const analysis = analyzeUserPerformance(battles)
    
    // OpenAI GPT-4oでコーチングアドバイスを生成
    const coachingAdvice = await generateCoachingAdvice(analysis)

    // 生成されたアドバイスをデータベースに保存
    const { error: saveError } = await supabase
      .from('coaching_sessions')
      .insert({
        user_id: user.id,
        analysis_data: analysis,
        coaching_advice: coachingAdvice,
        battles_analyzed: battles.length,
        created_at: new Date().toISOString()
      })

    if (saveError) {
      console.error('Failed to save coaching session:', saveError)
      // エラーでもアドバイスは返す
    }

    return NextResponse.json({
      success: true,
      analysis,
      coaching_advice: coachingAdvice,
      battles_analyzed: battles.length
    })

  } catch (error) {
    console.error('Coaching analysis error:', error)
    
    const errorMessage = error instanceof Error ? error.message : '予期せぬエラーが発生しました'
    
    return NextResponse.json({ 
      error: `AIコーチング分析に失敗しました: ${errorMessage}`
    }, { status: 500 })
  }
}