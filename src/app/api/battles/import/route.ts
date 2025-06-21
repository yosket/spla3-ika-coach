import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

interface BattleResult {
  id: string
  mode: string
  stage: string
  result: 'win' | 'lose'
  kills: number
  deaths: number
  assists: number
  paint_point: number
  weapon: string
  played_time: string
}

// Nintendo API経由でバトルデータを取得する関数
async function fetchBattleDataFromNintendo(sessionToken: string): Promise<BattleResult[]> {
  try {
    // 実際のnxapi実装はここに記述
    // 現在は開発段階なので改良されたモックデータを返す
    
    console.log('Fetching battle data with token:', sessionToken.substring(0, 10) + '...')
    
    const currentTime = Date.now()
    const modes = ['ナワバリバトル', 'ガチエリア', 'ガチヤグラ', 'ガチホコバトル', 'ガチアサリ']
    const stages = [
      'マサバ海峡大橋', 'ザトウマーケット', 'ユノハナ大渓谷', 'ゴンズイ地区',
      'ヤガラ市場', 'マテガイ放水路', 'ナメロウ金属', 'マヒマヒリゾート&スパ'
    ]
    const weapons = [
      'スプラシューター', 'わかばシューター', '.52ガロン', 'プロモデラーMG',
      'スプラチャージャー', 'スクイックリンα', 'カーボンローラー', 'スプラスピナー'
    ]

    const battles: BattleResult[] = []
    
    // 最新15試合をシミュレート
    for (let i = 0; i < 15; i++) {
      const battleTime = currentTime - (i * 1200000) // 20分間隔
      const isWin = Math.random() > 0.4 // 60%の勝率
      
      battles.push({
        id: `nintendo-battle-${battleTime}-${i}`,
        mode: modes[Math.floor(Math.random() * modes.length)],
        stage: stages[Math.floor(Math.random() * stages.length)],
        result: isWin ? 'win' : 'lose',
        kills: Math.floor(Math.random() * 15) + 1,
        deaths: Math.floor(Math.random() * 10) + 1,
        assists: Math.floor(Math.random() * 8),
        paint_point: Math.floor(Math.random() * 1500) + 500,
        weapon: weapons[Math.floor(Math.random() * weapons.length)],
        played_time: new Date(battleTime).toISOString(),
      })
    }

    console.log(`Generated ${battles.length} mock battles`)
    return battles

  } catch (error) {
    console.error('Nintendo API fetch error:', error)
    throw new Error('Nintendo APIからのデータ取得に失敗しました')
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // ユーザー認証確認
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    // トークンの取得
    const { data: tokenData, error: tokenError } = await supabase
      .from('encrypted_tokens')
      .select('encrypted_data')
      .eq('user_id', user.id)
      .single()

    if (tokenError || !tokenData) {
      return NextResponse.json({ 
        error: 'Nintendo連携が必要です。設定ページでトークンを登録してください。' 
      }, { status: 400 })
    }

    // 簡単な復号化（本格実装では crypto-js を使用）
    const sessionToken = atob(tokenData.encrypted_data)

    // Nintendo APIからバトルデータを取得（Edge Function内のロジックを移植）
    const battleResults = await fetchBattleDataFromNintendo(sessionToken)

    if (battleResults.length === 0) {
      return NextResponse.json({ 
        success: true, 
        imported: 0,
        message: '新しいバトルデータは見つかりませんでした' 
      })
    }

    // バトルデータをSupabaseに保存
    const { error: insertError } = await supabase
      .from('battles')
      .upsert(
        battleResults.map(battle => ({
          id: battle.id,
          user_id: user.id,
          battle_data: {
            mode: battle.mode,
            stage: battle.stage,
            result: battle.result,
            kills: battle.kills,
            deaths: battle.deaths,
            assists: battle.assists,
            paint_point: battle.paint_point,
            weapon: battle.weapon,
            played_time: battle.played_time,
          },
          played_at: battle.played_time,
        })),
        { onConflict: 'id' }
      )

    if (insertError) {
      console.error('Database insert error:', insertError)
      throw new Error('データベースへの保存に失敗しました')
    }

    return NextResponse.json({ 
      success: true, 
      imported: battleResults.length,
      message: `${battleResults.length}件のバトルデータを取得しました` 
    })

  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json({ 
      error: '予期せぬエラーが発生しました' 
    }, { status: 500 })
  }
}