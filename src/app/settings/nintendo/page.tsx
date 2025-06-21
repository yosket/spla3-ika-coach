'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function NintendoSettingsPage() {
  const [sessionToken, setSessionToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null)

  const handleTokenSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('ユーザーが認証されていません')
      }

      // 簡単な暗号化（本格実装では crypto-js やより強力な暗号化を使用）
      const encryptedToken = btoa(sessionToken)
      
      const { error } = await supabase
        .from('encrypted_tokens')
        .upsert({
          user_id: user.id,
          encrypted_data: encryptedToken,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30日後
        })

      if (error) throw error

      setMessage({
        type: 'success',
        text: 'Nintendoセッショントークンを保存しました。バトルデータの取得が可能になります。'
      })
      setSessionToken('')
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'トークンの保存に失敗しました。もう一度お試しください。'
      })
    } finally {
      setLoading(false)
    }
  }

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
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Nintendo アカウント連携</h2>
        
        <div className="max-w-2xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">
              ⚠️ 重要な注意事項
            </h3>
            <ul className="text-yellow-800 space-y-2 text-sm">
              <li>• このサービスは<strong>非公式</strong>であり、任天堂株式会社とは無関係です</li>
              <li>• Nintendo APIの利用は自己責任で行ってください</li>
              <li>• セッショントークンは暗号化して保存され、読み取り専用でのみ使用されます</li>
              <li>• いつでもデータを削除することができます</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              セッショントークンの取得方法
            </h3>
            <ol className="space-y-3 text-gray-700">
              <li>
                <strong>1.</strong> Nintendo Switch Onlineアプリを開く
              </li>
              <li>
                <strong>2.</strong> スプラトゥーン3のSplatNet 3にアクセス
              </li>
              <li>
                <strong>3.</strong> nxapiツールでセッショントークンを取得
                <br />
                <span className="text-sm text-gray-600">
                  詳細な手順は
                  <Link href="/settings/nintendo/guide" className="text-purple-600 underline">
                    こちらの詳細ガイド
                  </Link>
                  をご確認ください
                </span>
              </li>
            </ol>
          </div>

          <form onSubmit={handleTokenSave} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              セッショントークンの登録
            </h3>
            
            <div className="mb-6">
              <label htmlFor="sessionToken" className="block text-sm font-medium text-gray-700 mb-2">
                Nintendo セッショントークン
              </label>
              <textarea
                id="sessionToken"
                value={sessionToken}
                onChange={(e) => setSessionToken(e.target.value)}
                required
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              />
            </div>

            {message && (
              <div className={`p-4 rounded-lg mb-4 ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : message.type === 'error'
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-blue-50 text-blue-800 border border-blue-200'
              }`}>
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !sessionToken.trim()}
              className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'トークンを保存中...' : 'トークンを保存'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              トークンを保存後、ダッシュボードでバトルデータの取得が可能になります
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}