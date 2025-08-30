'use client'

import { useSession, signIn } from 'next-auth/react'
import { TaskDashboard } from '@/components/TaskDashboard'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export default function Home() {
  const { status } = useSession()

  if (status === 'loading') {
    return <LoadingSpinner />
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              タスクスケジューラー
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              実績ベース動的計画管理システム
            </p>
            <p className="text-sm text-gray-500 mb-8">
              ルーティンタスクの実績データから最適な計画を自動生成し、<br />
              臨機応変な計画変更をサポートします。
            </p>
          </div>
          <button
            onClick={() => signIn(undefined, { callbackUrl: '/' })}
            className="w-full inline-flex justify-center py-3 px-6 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            サインインして開始
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TaskDashboard />
    </div>
  )
}
