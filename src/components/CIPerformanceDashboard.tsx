'use client'

import { useState, useEffect } from 'react'

interface CacheAnalysis {
  totalSteps: number
  hits: number
  hitRate: number
  details: Array<{
    name: string
    conclusion: string
    duration: number
    isHit: boolean
  }>
}

interface PerformanceData {
  runId: number
  runNumber: number
  branch: string
  event: string
  conclusion: string
  createdAt: string
  duration: number
  durationMinutes: number
  testJobDuration: number
  securityJobDuration: number
  cache: CacheAnalysis
  isOptimal: boolean
}

interface PerformanceSummary {
  totalRuns: number
  avgDuration: number
  avgDurationMinutes: number
  avgCacheHitRate: number
  fastestRun: number
  slowestRun: number
  optimalRuns: number
  optimalRate: number
  trend: string
  recentAvgDuration: number
  alerts: Array<{
    type: string
    category: string
    message: string
    severity: string
  }>
  analyzedAt: string
  baseline: {
    expectedDurationRange: number[]
    expectedImprovement: number
    actualPerformance: string
  }
}

interface CIPerformanceDashboardProps {
  className?: string
}

export function CIPerformanceDashboard({ className = '' }: CIPerformanceDashboardProps) {
  const [summary, setSummary] = useState<PerformanceSummary | null>(null)
  const [detailed, setDetailed] = useState<PerformanceData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const fetchPerformanceData = async () => {
    try {
      setLoading(true)
      setError(null)

      // In a real implementation, these would be API endpoints
      // For now, we'll simulate loading from the static files
      const summaryResponse = await fetch('/api/ci-performance/summary')
      const detailedResponse = await fetch('/api/ci-performance/detailed')

      if (!summaryResponse.ok || !detailedResponse.ok) {
        // Fallback to mock data for development
        const mockSummary: PerformanceSummary = {
          totalRuns: 20,
          avgDuration: 141,
          avgDurationMinutes: 2.35,
          avgCacheHitRate: 88.4,
          fastestRun: 90,
          slowestRun: 204,
          optimalRuns: 11,
          optimalRate: 55,
          trend: 'stable',
          recentAvgDuration: 129,
          alerts: [],
          analyzedAt: new Date().toISOString(),
          baseline: {
            expectedDurationRange: [90, 150],
            expectedImprovement: 60,
            actualPerformance: 'meeting-expectations'
          }
        }

        const mockDetailed: PerformanceData[] = Array.from({ length: 10 }, (_, i) => ({
          runId: 1000000 + i,
          runNumber: 50 - i,
          branch: i % 3 === 0 ? 'feature/test' : 'main',
          event: 'push',
          conclusion: i % 8 === 0 ? 'failure' : 'success',
          createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
          duration: Math.floor(Math.random() * 60) + 120,
          durationMinutes: Math.round((Math.floor(Math.random() * 60) + 120) / 60 * 100) / 100,
          testJobDuration: Math.floor(Math.random() * 60) + 100,
          securityJobDuration: Math.floor(Math.random() * 20) + 40,
          cache: {
            totalSteps: 4,
            hits: Math.floor(Math.random() * 2) + 3,
            hitRate: Math.floor(Math.random() * 20) + 80,
            details: []
          },
          isOptimal: Math.random() > 0.3
        }))

        setSummary(mockSummary)
        setDetailed(mockDetailed)
      } else {
        const summaryData = await summaryResponse.json()
        const detailedData = await detailedResponse.json()
        setSummary(summaryData)
        setDetailed(detailedData)
      }

      setLastRefresh(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load performance data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPerformanceData()
  }, [])

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '📈'
      case 'degrading': return '📉'
      default: return '📊'
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-600'
      case 'degrading': return 'text-red-600'
      default: return 'text-blue-600'
    }
  }

  const getPerformanceStatusColor = (status: string) => {
    switch (status) {
      case 'meeting-expectations': return 'text-green-600'
      case 'below-expectations': return 'text-red-600'
      default: return 'text-yellow-600'
    }
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="text-red-600">
          <h3 className="text-lg font-semibold mb-2">エラー</h3>
          <p>{error}</p>
          <button
            onClick={fetchPerformanceData}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            再試行
          </button>
        </div>
      </div>
    )
  }

  if (!summary) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <p className="text-gray-500">パフォーマンスデータが利用できません</p>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">CI パフォーマンス監視</h2>
          <div className="flex items-center space-x-4">
            {lastRefresh && (
              <span className="text-sm text-gray-500">
                最終更新: {lastRefresh.toLocaleTimeString('ja-JP')}
              </span>
            )}
            <button
              onClick={fetchPerformanceData}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              更新
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {summary.alerts && summary.alerts.length > 0 && (
        <div className="p-6 border-b border-gray-200 bg-yellow-50">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">⚠️ アラート</h3>
          <div className="space-y-2">
            {summary.alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-3 rounded ${
                  alert.type === 'error'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                <span className="font-medium">[{alert.severity.toUpperCase()}]</span> {alert.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Average Duration */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-blue-600 mb-1">平均実行時間</div>
            <div className="text-2xl font-bold text-blue-700">
              {summary.avgDurationMinutes} 分
            </div>
            <div className="text-xs text-blue-600">
              目標: 1.5-2.5 分
            </div>
          </div>

          {/* Cache Hit Rate */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm text-green-600 mb-1">キャッシュヒット率</div>
            <div className="text-2xl font-bold text-green-700">
              {summary.avgCacheHitRate}%
            </div>
            <div className="text-xs text-green-600">
              目標: 85%以上
            </div>
          </div>

          {/* Optimal Runs */}
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-sm text-purple-600 mb-1">最適実行率</div>
            <div className="text-2xl font-bold text-purple-700">
              {summary.optimalRate}%
            </div>
            <div className="text-xs text-purple-600">
              {summary.optimalRuns}/{summary.totalRuns} 回
            </div>
          </div>

          {/* Performance Trend */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">パフォーマンス傾向</div>
            <div className={`text-2xl font-bold ${getTrendColor(summary.trend)}`}>
              {getTrendIcon(summary.trend)} {summary.trend}
            </div>
            <div className="text-xs text-gray-600">
              最近の平均: {Math.round(summary.recentAvgDuration / 60 * 100) / 100} 分
            </div>
          </div>
        </div>

        {/* Baseline Comparison */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">🎯 PR #19 最適化効果</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-600">最適化前の想定</div>
              <div className="text-lg font-semibold">4-6 分</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">最適化目標</div>
              <div className="text-lg font-semibold">1.5-2.5 分</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">実際の性能</div>
              <div className={`text-lg font-semibold ${getPerformanceStatusColor(summary.baseline.actualPerformance)}`}>
                {summary.avgDurationMinutes} 分
                <span className="text-sm ml-2">
                  ({summary.baseline.actualPerformance.replace('-', ' ')})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Runs */}
        <div>
          <h3 className="text-lg font-semibold mb-4">📋 最近の実行履歴</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    実行
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ブランチ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    時間
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    キャッシュ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状態
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    日時
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {detailed.slice(0, 10).map((run) => (
                  <tr key={run.runId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{run.runNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {run.branch}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {run.durationMinutes} 分
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {run.cache.hitRate}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        run.conclusion === 'success'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {run.conclusion === 'success' ? '成功' : '失敗'}
                      </span>
                      {run.isOptimal && (
                        <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          最適
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(run.createdAt).toLocaleDateString('ja-JP')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}