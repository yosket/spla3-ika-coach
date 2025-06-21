import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import Link from 'next/link'

interface BattleDetailPageProps {
  params: { id: string }
}

export default async function BattleDetailPage({ params }: BattleDetailPageProps) {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/auth/login')
  }

  // 指定されたバトルデータを取得
  const { data: battle, error: battleError } = await supabase
    .from('battles')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (battleError || !battle) {
    notFound()
  }

  const battleData = battle.battle_data as any
  const isWin = battleData.result === 'win'
  
  // K/D比計算
  const kdRatio = battleData.deaths > 0 ? (battleData.kills / battleData.deaths).toFixed(2) : battleData.kills.toFixed(2)
  
  // 結果による色設定
  const resultColor = isWin ? 'text-green-600' : 'text-red-600'
  const resultBg = isWin ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
  
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
            <div className="flex space-x-4">
              <Link
                href="/battles"
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                バトル一覧に戻る
              </Link>
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                ダッシュボード
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* バトル結果ヘッダー */}
          <div className={`rounded-lg border p-6 mb-8 ${resultBg}`}>
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  バトル詳細分析
                </h2>
                <div className="flex items-center space-x-4">
                  <span className={`text-2xl font-bold ${resultColor}`}>
                    {isWin ? '勝利' : '敗北'}
                  </span>
                  <span className="text-lg text-gray-700">{battleData.mode}</span>
                  <span className="text-lg text-gray-700">{battleData.stage}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">
                  {new Date(battle.played_at).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  ID: {battle.id}
                </div>
              </div>
            </div>
          </div>

          {/* 成績サマリー */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-red-500 mb-2">
                {battleData.kills}
              </div>
              <div className="text-sm text-gray-600">キル数</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-gray-600 mb-2">
                {battleData.deaths}
              </div>
              <div className="text-sm text-gray-600">デス数</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-blue-500 mb-2">
                {battleData.assists}
              </div>
              <div className="text-sm text-gray-600">アシスト数</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-purple-500 mb-2">
                {kdRatio}
              </div>
              <div className="text-sm text-gray-600">K/D比</div>
            </div>
          </div>

          {/* 詳細情報 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* ブキ情報 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">使用ブキ</h3>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  🔫
                </div>
                <div>
                  <div className="font-medium text-gray-800">{battleData.weapon}</div>
                  <div className="text-sm text-gray-600">
                    このブキでの成績: {battleData.kills}K/{battleData.deaths}D/{battleData.assists}A
                  </div>
                </div>
              </div>
            </div>

            {/* 塗りポイント */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">塗り成績</h3>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-200 rounded-lg flex items-center justify-center">
                  🎨
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {battleData.paint_point?.toLocaleString() || 0}p
                  </div>
                  <div className="text-sm text-gray-600">塗りポイント</div>
                </div>
              </div>
            </div>
          </div>

          {/* パフォーマンス分析 */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">パフォーマンス分析</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 撃破効率 */}
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {battleData.kills > 0 ? ((battleData.kills / (battleData.kills + battleData.deaths)) * 100).toFixed(1) : '0.0'}%
                </div>
                <div className="text-sm text-gray-600">撃破効率</div>
                <div className="text-xs text-gray-500 mt-1">
                  (キル数 ÷ (キル数 + デス数))
                </div>
              </div>

              {/* 貢献度 */}
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {battleData.kills + battleData.assists}
                </div>
                <div className="text-sm text-gray-600">総貢献数</div>
                <div className="text-xs text-gray-500 mt-1">
                  (キル数 + アシスト数)
                </div>
              </div>

              {/* リスク管理 */}
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {battleData.deaths === 0 ? '完璧' : battleData.deaths <= 3 ? '良好' : battleData.deaths <= 6 ? '普通' : '要改善'}
                </div>
                <div className="text-sm text-gray-600">リスク管理</div>
                <div className="text-xs text-gray-500 mt-1">
                  (デス数による評価)
                </div>
              </div>
            </div>
          </div>

          {/* 改善提案 */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">💡</span>
              このバトルの改善ポイント
            </h3>
            
            <div className="space-y-3">
              {battleData.deaths > 6 && (
                <div className="flex items-start space-x-3">
                  <span className="text-red-500 mt-1">⚠️</span>
                  <div>
                    <div className="font-medium text-gray-800">デス数を減らす</div>
                    <div className="text-sm text-gray-600">
                      {battleData.deaths}デスは多めです。ポジション取りや退き時を意識しましょう。
                    </div>
                  </div>
                </div>
              )}
              
              {battleData.kills < 5 && battleData.result === 'lose' && (
                <div className="flex items-start space-x-3">
                  <span className="text-orange-500 mt-1">🎯</span>
                  <div>
                    <div className="font-medium text-gray-800">撃破数を増やす</div>
                    <div className="text-sm text-gray-600">
                      キル数が{battleData.kills}と少なめです。積極的に前線に参加しましょう。
                    </div>
                  </div>
                </div>
              )}
              
              {battleData.paint_point < 800 && (
                <div className="flex items-start space-x-3">
                  <span className="text-blue-500 mt-1">🎨</span>
                  <div>
                    <div className="font-medium text-gray-800">塗り貢献を増やす</div>
                    <div className="text-sm text-gray-600">
                      塗りポイントが{battleData.paint_point}pと低めです。オブジェクトや地塗りを意識しましょう。
                    </div>
                  </div>
                </div>
              )}
              
              {battleData.assists < 3 && (
                <div className="flex items-start space-x-3">
                  <span className="text-green-500 mt-1">🤝</span>
                  <div>
                    <div className="font-medium text-gray-800">チーム連携を強化</div>
                    <div className="text-sm text-gray-600">
                      アシスト数が{battleData.assists}と少なめです。味方との連携を意識しましょう。
                    </div>
                  </div>
                </div>
              )}
              
              {isWin && battleData.kills >= 8 && battleData.deaths <= 4 && (
                <div className="flex items-start space-x-3">
                  <span className="text-green-500 mt-1">🌟</span>
                  <div>
                    <div className="font-medium text-gray-800">素晴らしいパフォーマンス！</div>
                    <div className="text-sm text-gray-600">
                      この調子を維持して、さらなる上達を目指しましょう。
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}