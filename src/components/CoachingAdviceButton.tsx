'use client'

import { useState } from 'react'

interface CoachingResult {
  analysis: {
    totalBattles: number
    winRate: number
    avgKills: number
    avgDeaths: number
    recentPerformance: {
      wins: number
      losses: number
      kdRatio: number
    }
  }
  coaching_advice: string
  battles_analyzed: number
}

export default function CoachingAdviceButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CoachingResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGetCoaching = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/coaching', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'AIコーチング分析に失敗しました')
      }

      setResult(data)
    } catch (err) {
      console.error('Coaching request failed:', err)
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* AIコーチング実行ボタン */}
      <div className="text-center">
        <button
          onClick={handleGetCoaching}
          disabled={loading}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>AI分析中...</span>
            </div>
          ) : (
            '🧠 AIコーチング分析を開始'
          )}
        </button>
        <p className="text-sm text-gray-600 mt-2">
          あなたのバトルデータをAIが分析し、個別のコーチングアドバイスを提供します
        </p>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <span className="text-red-600 font-semibold">⚠️ エラー</span>
          </div>
          <p className="text-red-800 mt-1">{error}</p>
        </div>
      )}

      {/* AIコーチング結果表示 */}
      {result && (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {/* ヘッダー */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4">
            <h3 className="text-lg font-bold flex items-center space-x-2">
              <span>🧠</span>
              <span>AIコーチング分析結果</span>
            </h3>
            <p className="text-purple-100 text-sm mt-1">
              {result.battles_analyzed}戦のデータを分析しました
            </p>
          </div>

          {/* 基本統計 */}
          <div className="p-4 bg-gray-50 border-b">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {result.analysis.winRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">勝率</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {result.analysis.avgKills.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">平均キル</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {result.analysis.recentPerformance.kdRatio.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">直近K/D比</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {result.analysis.recentPerformance.wins}勝{result.analysis.recentPerformance.losses}敗
                </div>
                <div className="text-sm text-gray-600">直近10戦</div>
              </div>
            </div>
          </div>

          {/* AIアドバイス */}
          <div className="p-6">
            <div 
              className="prose prose-sm max-w-none text-gray-800"
              dangerouslySetInnerHTML={{ 
                __html: result.coaching_advice
                  .replace(/\n/g, '<br>')
                  .replace(/#{1,6}\s*/g, '')
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
                  .replace(/###\s*(.*?)(\n|$)/g, '<h3 class="text-lg font-semibold text-gray-800 mt-4 mb-2">$1</h3>')
                  .replace(/##\s*(.*?)(\n|$)/g, '<h2 class="text-xl font-bold text-gray-900 mt-6 mb-3">$1</h2>')
                  .replace(/^-\s*(.*?)$/gm, '<li class="ml-4">$1</li>')
              }}
            />
          </div>

          {/* フッター */}
          <div className="bg-gray-50 px-6 py-3 text-center border-t">
            <p className="text-xs text-gray-500">
              💡 このアドバイスは過去の戦績データに基づくAI分析です。実践時は自分のプレイスタイルに合わせて調整してください。
            </p>
          </div>
        </div>
      )}
    </div>
  )
}