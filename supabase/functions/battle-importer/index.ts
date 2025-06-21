import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  sessionToken: string
  userId: string
}

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
    
    // 最新50試合をシミュレート
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

    console.log(`Generated ${battles.length} mock battles for user`)
    return battles

  } catch (error) {
    console.error('Nintendo API fetch error:', error)
    throw new Error('Nintendo APIからのデータ取得に失敗しました')
  }
}

serve(async (req) => {
  // CORS対応
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { sessionToken, userId } = await req.json() as RequestBody

    if (!sessionToken || !userId) {
      throw new Error('セッショントークンとユーザーIDが必要です')
    }

    // Supabaseクライアント作成
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log(`Starting battle import for user: ${userId}`)

    // Nintendo APIからバトルデータを取得
    const battleResults = await fetchBattleDataFromNintendo(sessionToken)

    if (battleResults.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          imported: 0,
          message: '新しいバトルデータは見つかりませんでした' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // バトルデータをSupabaseに保存
    const { error } = await supabase
      .from('battles')
      .upsert(
        battleResults.map(battle => ({
          id: battle.id,
          user_id: userId,
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

    if (error) {
      console.error('Database insert error:', error)
      throw new Error('データベースへの保存に失敗しました')
    }

    console.log(`Successfully imported ${battleResults.length} battles`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        imported: battleResults.length,
        message: `${battleResults.length}件のバトルデータを取得しました` 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Battle import error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || '予期せぬエラーが発生しました'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})