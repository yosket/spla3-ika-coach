import Link from 'next/link'

export default function NintendoGuidePage() {
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
              href="/settings/nintendo"
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              設定に戻る
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">
          Nintendo セッショントークン取得ガイド
        </h2>
        
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* 重要な警告 */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              ⚠️ 重要な注意事項
            </h3>
            <ul className="text-red-800 space-y-1 text-sm">
              <li>• この方法は<strong>非公式</strong>であり、任天堂の利用規約に抵触する可能性があります</li>
              <li>• 実行は完全に自己責任でお願いします</li>
              <li>• アカウントの停止や制限のリスクがあります</li>
              <li>• トークンは他人と絶対に共有しないでください</li>
            </ul>
          </div>

          {/* 必要なツール */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              必要なもの
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li>• <strong>スマートフォン</strong>（Nintendo Switch Onlineアプリ）</li>
              <li>• <strong>PC/Mac</strong>（nxapiツール実行用）</li>
              <li>• <strong>Node.js</strong>がインストールされたPC環境</li>
              <li>• <strong>Nintendo Switch Online</strong>の有効なサブスクリプション</li>
            </ul>
          </div>

          {/* 手順1: nxapiのセットアップ */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              手順1: nxapiのセットアップ
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">A. Node.jsのインストール</h4>
                <p className="text-gray-600 text-sm mb-2">
                  <a href="https://nodejs.org/" target="_blank" rel="noopener noreferrer" 
                     className="text-purple-600 underline">
                    https://nodejs.org/
                  </a> からNode.js（LTS版）をダウンロードしてインストール
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">B. nxapiのインストール</h4>
                <div className="bg-gray-100 rounded p-3 font-mono text-sm">
                  npm install -g nxapi
                </div>
              </div>
            </div>
          </div>

          {/* 手順2: 認証 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              手順2: Nintendo アカウント認証
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">A. 認証コマンドの実行</h4>
                <div className="bg-gray-100 rounded p-3 font-mono text-sm mb-2">
                  nxapi nso auth
                </div>
                <p className="text-gray-600 text-sm">
                  このコマンドを実行すると、ブラウザが開いてNintendo アカウントのログイン画面が表示されます
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">B. ログインと認証</h4>
                <ol className="list-decimal list-inside space-y-1 text-gray-600 text-sm">
                  <li>開いたブラウザでNintendo アカウントにログイン</li>
                  <li>認証を完了させる</li>
                  <li>「この連携を許可」をクリック</li>
                  <li>認証が完了すると、ターミナルにトークンが表示されます</li>
                </ol>
              </div>
            </div>
          </div>

          {/* 手順3: セッショントークン取得 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              手順3: セッショントークンの取得
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">A. トークン表示コマンド</h4>
                <div className="bg-gray-100 rounded p-3 font-mono text-sm mb-2">
                  nxapi nso token
                </div>
                <p className="text-gray-600 text-sm">
                  認証完了後、このコマンドでセッショントークンを表示できます
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">B. トークンのコピー</h4>
                <p className="text-gray-600 text-sm">
                  表示されたトークン（通常は長い文字列）を全てコピーします
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-2">
                  <p className="text-yellow-800 text-sm">
                    <strong>注意:</strong> トークンは機密情報です。他人と共有したり、公開しないでください
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 手順4: トークンの登録 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibent text-gray-800 mb-4">
              手順4: トークンの登録
            </h3>
            <div className="space-y-4">
              <p className="text-gray-600">
                取得したセッショントークンを、
                <Link href="/settings/nintendo" className="text-purple-600 underline">
                  Nintendo連携設定ページ
                </Link>
                のテキストエリアに貼り付けて「トークンを保存」をクリックしてください。
              </p>
              
              <div className="bg-green-50 border border-green-200 rounded p-3">
                <p className="text-green-800 text-sm">
                  <strong>成功:</strong> トークンが正常に保存されると、バトルデータの取得が可能になります
                </p>
              </div>
            </div>
          </div>

          {/* トラブルシューティング */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              トラブルシューティング
            </h3>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-gray-700">Q: nxapiコマンドが見つからない</h4>
                <p className="text-gray-600 text-sm">
                  A: Node.jsが正しくインストールされているか確認し、<code className="bg-gray-100 px-1 rounded">npm install -g nxapi</code>を再実行してください
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-700">Q: 認証に失敗する</h4>
                <p className="text-gray-600 text-sm">
                  A: Nintendo アカウントの2段階認証が有効な場合、認証アプリで生成されたコードが必要です
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-700">Q: トークンが無効になった</h4>
                <p className="text-gray-600 text-sm">
                  A: セッショントークンは定期的に期限切れになります。その場合は再度この手順を実行してください
                </p>
              </div>
            </div>
          </div>

          {/* フッター */}
          <div className="text-center pt-8">
            <Link
              href="/settings/nintendo"
              className="inline-block bg-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors"
            >
              設定ページに戻る
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}