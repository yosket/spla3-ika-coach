import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/auth/login')
  }

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
        <h2 className="text-3xl font-bold text-gray-800 mb-8">ダッシュボード</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Nintendo アカウント連携
            </h3>
            <p className="text-gray-600 mb-4">
              バトルデータを取得するには、Nintendo アカウントとの連携が必要です。
            </p>
            <Link
              href="/settings/nintendo"
              className="inline-block bg-purple-600 text-white font-bold py-2 px-4 rounded hover:bg-purple-700 transition-colors"
            >
              連携設定へ
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              最近のバトル
            </h3>
            <p className="text-gray-600 mb-4">
              Nintendo アカウントを連携すると、ここに最近のバトルが表示されます。
            </p>
            <Link
              href="/battles"
              className="inline-block bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-700 transition-colors"
            >
              バトル一覧へ
            </Link>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            使い方
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Nintendo アカウントとの連携を設定</li>
            <li>バトルデータを自動取得</li>
            <li>統計情報とAI分析を確認</li>
            <li>改善アドバイスを実践</li>
          </ol>
        </div>
      </main>
    </div>
  )
}