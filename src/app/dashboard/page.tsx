import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import StatsOverview from '@/components/StatsOverview'
import CoachingAdviceButton from '@/components/CoachingAdviceButton'
import { calculateUserStats } from '@/lib/stats'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/auth/login')
  }

  // バトルデータを取得して統計計算
  const { data: battles } = await supabase
    .from('battles')
    .select('*')
    .eq('user_id', user.id)
    .order('played_at', { ascending: false })

  const stats = calculateUserStats(battles || [])

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
            <h1 className="text-xl font-bold text-purple-900">Spla3 AI Coach</h1>
            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                ログアウト
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">ダッシュボード</h2>
          
          {/* クイックアクション */}
          <div className="flex space-x-4">
            <Link
              href="/battles"
              className="bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-700 transition-colors"
            >
              バトル一覧
            </Link>
            <Link
              href="/settings/nintendo"
              className="bg-purple-600 text-white font-bold py-2 px-4 rounded hover:bg-purple-700 transition-colors"
            >
              {tokenData ? 'Nintendo設定' : 'Nintendo連携'}
            </Link>
          </div>
        </div>

        {/* 統計表示 */}
        <StatsOverview stats={stats} />

        {/* AIコーチング機能 */}
        {stats.totalBattles > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              🧠 AIコーチング分析
            </h3>
            <CoachingAdviceButton />
          </div>
        )}

        {/* 初回セットアップガイド */}
        {!tokenData && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              🚀 セットアップガイド
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-800">
              <li>
                <Link href="/settings/nintendo" className="underline hover:no-underline">
                  Nintendo アカウントとの連携
                </Link>
                を設定
              </li>
              <li>バトルデータを自動取得</li>
              <li>統計情報とAI分析を確認</li>
              <li>改善アドバイスを実践</li>
            </ol>
          </div>
        )}

        {/* 最近のアクティビティ */}
        {stats.totalBattles > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              最近のアクティビティ
            </h3>
            <div className="space-y-3">
              {battles?.slice(0, 5).map((battle) => (
                <div key={battle.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <span className={`w-3 h-3 rounded-full ${
                      (battle.battle_data as any)?.result === 'win' ? 'bg-green-500' : 'bg-red-500'
                    }`}></span>
                    <span className="font-medium">{(battle.battle_data as any)?.mode}</span>
                    <span className="text-gray-600">{(battle.battle_data as any)?.stage}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      {new Date(battle.played_at).toLocaleDateString('ja-JP')}
                    </div>
                    <div className="text-sm">
                      {(battle.battle_data as any)?.kills}/{(battle.battle_data as any)?.deaths}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-center">
              <Link
                href="/battles"
                className="text-purple-600 hover:text-purple-800 font-medium"
              >
                すべてのバトルを見る →
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}