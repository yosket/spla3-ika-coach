import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

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

    // Supabase Edge Functionを呼び出し
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const functionUrl = `${supabaseUrl}/functions/v1/battle-importer`
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
      },
      body: JSON.stringify({
        sessionToken,
        userId: user.id,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'バトルデータの取得に失敗しました')
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json({ 
      error: '予期せぬエラーが発生しました' 
    }, { status: 500 })
  }
}