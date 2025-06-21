import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold text-purple-900 mb-4">
            Spla3 AI Coach
          </h1>
          <p className="text-xl text-gray-700">
            スプラトゥーン3のバトルデータを分析し、
            <br />
            AIによる個別コーチングアドバイスを提供します
          </p>
        </header>

        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            サービスの特徴
          </h2>
          <ul className="space-y-4">
            <li className="flex items-start">
              <span className="text-purple-600 mr-2">✓</span>
              <div>
                <h3 className="font-semibold">バトルデータ自動取得</h3>
                <p className="text-gray-600">SplatNet 3から最新50試合のデータを自動で取得</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-purple-600 mr-2">✓</span>
              <div>
                <h3 className="font-semibold">詳細な統計分析</h3>
                <p className="text-gray-600">勝率、K/D、塗りポイントなどを多角的に分析</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-purple-600 mr-2">✓</span>
              <div>
                <h3 className="font-semibold">AIコーチング</h3>
                <p className="text-gray-600">GPT-4による個別の改善アドバイスを日本語で提供</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-purple-600 mr-2">✓</span>
              <div>
                <h3 className="font-semibold">プライバシー保護</h3>
                <p className="text-gray-600">トークンは暗号化され、いつでもデータ削除可能</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="text-center">
          <Link
            href="/auth/login"
            className="inline-block bg-purple-600 text-white font-bold py-4 px-8 rounded-lg hover:bg-purple-700 transition-colors duration-200 text-lg"
          >
            始める
          </Link>
        </div>

        <div className="mt-16 text-center text-sm text-gray-600">
          <p>
            このサービスは任天堂株式会社とは無関係の非公式サービスです。
            <br />
            「Splatoon」は任天堂の登録商標です。
          </p>
        </div>
      </div>
    </div>
  );
}