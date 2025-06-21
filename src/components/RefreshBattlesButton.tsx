'use client'

import { useState } from 'react'

interface RefreshBattlesButtonProps {
  hasToken: boolean
}

export default function RefreshBattlesButton({ hasToken }: RefreshBattlesButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleRefresh = async () => {
    setLoading(true)
    
    try {
      // TODO: バトルデータ取得API呼び出しを実装
      await new Promise(resolve => setTimeout(resolve, 1000)) // 仮の遅延
      alert('バトルデータ取得機能は開発中です')
    } catch (error) {
      alert('エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  if (!hasToken) return null

  return (
    <button
      onClick={handleRefresh}
      disabled={loading}
      className="bg-purple-600 text-white font-bold py-2 px-4 rounded hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? 'データ取得中...' : '最新データを取得'}
    </button>
  )
}