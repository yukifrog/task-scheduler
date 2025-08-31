'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { CIPerformanceDashboard } from '@/components/CIPerformanceDashboard'

export default function CIPerformancePage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">読み込み中...</div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">認証が必要です</h1>
          <Link href="/auth/signin" className="text-blue-600 hover:text-blue-800">
            サインインする
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                CI パフォーマンス監視
              </h1>
              <p className="text-gray-600">
                GitHub Actions の実行時間とキャッシュ効率を監視
              </p>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex space-x-1">
            <Link
              href="/"
              className="px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100"
            >
              ダッシュボード
            </Link>
            <a
              href="/routines"
              className="px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100"
            >
              ルーティン管理
            </a>
            <Link
              href="/ci-performance"
              className="px-4 py-2 rounded-md bg-blue-600 text-white"
            >
              CI監視
            </Link>
          </div>
        </div>

        {/* CI Performance Dashboard */}
        <CIPerformanceDashboard />
      </div>
    </div>
  )
}