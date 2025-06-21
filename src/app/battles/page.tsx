import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function BattlesPage() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/auth/login')
  }

  // バトルデータを取得
  const { data: battles, error: battlesError } = await supabase
    .from('battles')
    .select('*')
    .eq('user_id', user.id)
    .order('played_at', { ascending: false })
    .limit(10)

  // トークンの存在確認
  const { data: tokenData } = await supabase
    .from('encrypted_tokens')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-purple-900">
              <Link href="/dashboard" className="hover:text-purple-700">
                Spla3 AI Coach
              </Link>
            </h1>
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              ダッシュボードに戻る
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">バトル履歴</h2>
          
          {tokenData && (
            <button
              className="bg-purple-600 text-white font-bold py-2 px-4 rounded hover:bg-purple-700 transition-colors"
              onClick={() => {
                // TODO: バトルデータ取得機能を実装
                alert('バトルデータ取得機能は開発中です')
              }}
            >
              最新データを取得
            </button>
          )}
        </div>

        {!tokenData ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">
              Nintendo アカウント連携が必要です
            </h3>
            <p className="text-yellow-800 mb-4">
              バトルデータを取得するには、まずNintendo アカウントとの連携を行ってください。
            </p>
            <Link
              href="/settings/nintendo"
              className="inline-block bg-yellow-600 text-white font-bold py-2 px-4 rounded hover:bg-yellow-700 transition-colors"
            >
              連携設定へ
            </Link>
          </div>
        ) : battles && battles.length > 0 ? (
          <div className="grid gap-4">
            {battles.map((battle) => (
              <div key={battle.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    バトル ID: {battle.id}
                  </h3>
                  <span className="text-sm text-gray-600">
                    {new Date(battle.played_at).toLocaleString('ja-JP')}
                  </span>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">モード</p>
                    <p className="font-medium">{(battle.battle_data as any)?.mode || '不明'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">ステージ</p>
                    <p className="font-medium">{(battle.battle_data as any)?.stage || '不明'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">結果</p>
                    <p className={`font-medium ${
                      (battle.battle_data as any)?.result === 'win' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {(battle.battle_data as any)?.result === 'win' ? '勝利' : '敗北'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">K/D</p>
                    <p className="font-medium">
                      {(battle.battle_data as any)?.kills || 0}/
                      {(battle.battle_data as any)?.deaths || 0}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              バトルデータがありません
            </h3>
            <p className="text-blue-800 mb-4">
              「最新データを取得」ボタンをクリックして、Nintendo Switch Onlineからバトルデータを取得してください。
            </p>
          </div>
        )}
      </main>
    </div>
  )
}