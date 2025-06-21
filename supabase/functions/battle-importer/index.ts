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

serve(async (req) => {
  // CORS対応
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { sessionToken, userId } = await req.json() as RequestBody

    // Supabaseクライアント作成
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // ここでnxapi統合を実装予定
    // 現在はモックデータを返す
    const mockBattles = [
      {
        id: 'mock-battle-1',
        played_at: new Date().toISOString(),
        battle_data: {
          mode: 'ガチエリア',
          stage: 'マサバ海峡大橋',
          result: 'win',
          kills: 8,
          deaths: 3,
          assists: 2,
          paint_point: 1234,
        }
      }
    ]

    // バトルデータを保存
    const { error } = await supabase
      .from('battles')
      .upsert(
        mockBattles.map(battle => ({
          id: battle.id,
          user_id: userId,
          battle_data: battle.battle_data,
          played_at: battle.played_at,
        })),
        { onConflict: 'id' }
      )

    if (error) throw error

    return new Response(
      JSON.stringify({ 
        success: true, 
        imported: mockBattles.length,
        message: 'バトルデータのインポートが完了しました' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})