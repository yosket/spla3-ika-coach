'use client'

import { UserStats, getStrongestWeakestModes, getRecommendedWeapons } from '@/lib/stats'

interface StatsOverviewProps {
  stats: UserStats
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
  const { strongest, weakest } = getStrongestWeakestModes(stats)
  const recommendedWeapons = getRecommendedWeapons(stats)

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return '📈'
      case 'down': return '📉' 
      default: return '➡️'
    }
  }

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'up': return 'text-green-600'
      case 'down': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  if (stats.totalBattles === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          統計データがありません
        </h3>
        <p className="text-blue-800">
          バトルデータを取得すると、詳細な統計情報がここに表示されます。
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 基本統計 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          総合統計 ({stats.totalBattles}試合)
        </h3>
        
        <div className="grid md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600">勝率</p>
            <p className="text-2xl font-bold text-purple-600">{stats.winRate}%</p>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">K/D比</p>
            <p className="text-2xl font-bold text-blue-600">{stats.kdRatio}</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">平均塗りポイント</p>
            <p className="text-2xl font-bold text-green-600">{stats.avgPaintPoints}p</p>
          </div>
          
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-gray-600">最近の調子</p>
            <p className={`text-lg font-bold ${getTrendColor(stats.recentTrend.improvementDirection)}`}>
              {getTrendIcon(stats.recentTrend.improvementDirection)} {stats.recentTrend.last10WinRate}%
            </p>
          </div>
        </div>
      </div>

      {/* 詳細統計 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* モード別統計 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">モード別成績</h4>
          
          {strongest && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-green-600 font-medium">🏆 得意なモード</p>
              <p className="text-green-800">
                <strong>{strongest[0]}</strong>: {strongest[1].winRate.toFixed(1)}% 
                ({strongest[1].battles}試合)
              </p>
            </div>
          )}
          
          {weakest && strongest && weakest[0] !== strongest[0] && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-sm text-red-600 font-medium">📈 改善の余地</p>
              <p className="text-red-800">
                <strong>{weakest[0]}</strong>: {weakest[1].winRate.toFixed(1)}% 
                ({weakest[1].battles}試合)
              </p>
            </div>
          )}

          <div className="space-y-2">
            {Object.entries(stats.modeStats)
              .sort(([_, a], [__, b]) => b.winRate - a.winRate)
              .map(([mode, data]) => (
                <div key={mode} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700">{mode}</span>
                  <div className="text-right">
                    <span className="font-medium">{data.winRate.toFixed(1)}%</span>
                    <span className="text-sm text-gray-500 ml-2">({data.battles}試合)</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* ブキ別統計 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">おすすめブキ</h4>
          
          {recommendedWeapons.length > 0 ? (
            <div className="space-y-3">
              {recommendedWeapons.map(([weapon, data], index) => (
                <div key={weapon} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </span>
                    <span className="font-medium text-gray-800">{weapon}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-purple-600">{data.winRate.toFixed(1)}%</div>
                    <div className="text-sm text-gray-500">K/D {data.avgKD.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">より多くのバトルデータが必要です</p>
          )}

          <div className="mt-4 pt-4 border-t border-gray-200">
            <h5 className="text-sm font-medium text-gray-700 mb-2">全ブキ成績</h5>
            <div className="space-y-1">
              {Object.entries(stats.weaponStats)
                .sort(([_, a], [__, b]) => b.winRate - a.winRate)
                .map(([weapon, data]) => (
                  <div key={weapon} className="flex justify-between text-sm">
                    <span className="text-gray-600">{weapon}</span>
                    <span>{data.winRate.toFixed(1)}% ({data.battles})</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* パフォーマンス詳細 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">パフォーマンス詳細</h4>
        <div className="grid md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600">平均キル数</p>
            <p className="text-xl font-bold text-red-500">{stats.avgKills}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">平均デス数</p>
            <p className="text-xl font-bold text-gray-600">{stats.avgDeaths}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">平均アシスト数</p>
            <p className="text-xl font-bold text-blue-500">{stats.avgAssists}</p>
          </div>
        </div>
      </div>
    </div>
  )
}