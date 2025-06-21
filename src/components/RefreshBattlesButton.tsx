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
      const response = await fetch('/api/battles/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'データ取得に失敗しました')
      }

      alert(data.message)
      
      // ページを再読み込みして新しいデータを表示
      window.location.reload()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'エラーが発生しました')
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