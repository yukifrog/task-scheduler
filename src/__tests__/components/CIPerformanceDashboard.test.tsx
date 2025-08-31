/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from '@testing-library/react'
import { CIPerformanceDashboard } from '@/components/CIPerformanceDashboard'

// Mock fetch globally
global.fetch = jest.fn()

describe('CIPerformanceDashboard', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear()
  })

  it('renders loading state initially', () => {
    (fetch as jest.Mock).mockImplementation(() => 
      new Promise(() => {}) // Never resolves
    )

    render(<CIPerformanceDashboard />)
    
    // Check for loading animation specifically
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('renders performance metrics when data is loaded', async () => {
    const mockSummary = {
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

    const mockDetailed = [
      {
        runId: 1000001,
        runNumber: 50,
        branch: 'main',
        event: 'push',
        conclusion: 'success',
        createdAt: new Date().toISOString(),
        duration: 150,
        durationMinutes: 2.5,
        testJobDuration: 120,
        securityJobDuration: 45,
        cache: {
          totalSteps: 4,
          hits: 3,
          hitRate: 75,
          details: []
        },
        isOptimal: true
      }
    ]

    ;(fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockSummary,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockDetailed,
      })

    render(<CIPerformanceDashboard />)

    await waitFor(() => {
      expect(screen.getByText('CI パフォーマンス監視')).toBeInTheDocument()
    })

    expect(screen.getByText('88.4%')).toBeInTheDocument()
    expect(screen.getByText('55%')).toBeInTheDocument()
    expect(screen.getByText(/stable/)).toBeInTheDocument()
  })

  it('handles API errors gracefully', async () => {
    ;(fetch as jest.Mock).mockRejectedValue(new Error('API Error'))

    render(<CIPerformanceDashboard />)

    await waitFor(() => {
      expect(screen.getByText('再試行')).toBeInTheDocument()
    })
  })

  it('displays alerts when present', async () => {
    const mockSummaryWithAlerts = {
      totalRuns: 10,
      avgDuration: 400, // Above threshold
      avgDurationMinutes: 6.67,
      avgCacheHitRate: 60, // Below threshold
      alerts: [
        {
          type: 'warning',
          category: 'performance',
          message: 'Average CI duration exceeds threshold',
          severity: 'medium'
        },
        {
          type: 'warning',
          category: 'cache',
          message: 'Cache hit rate below optimal threshold',
          severity: 'high'
        }
      ],
      trend: 'degrading',
      baseline: {
        expectedDurationRange: [90, 150],
        expectedImprovement: 60,
        actualPerformance: 'below-expectations'
      }
    }

    ;(fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockSummaryWithAlerts,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })

    render(<CIPerformanceDashboard />)

    await waitFor(() => {
      expect(screen.getByText('⚠️ アラート')).toBeInTheDocument()
    })

    expect(screen.getByText(/Average CI duration exceeds threshold/)).toBeInTheDocument()
    expect(screen.getByText(/Cache hit rate below optimal threshold/)).toBeInTheDocument()
  })

  it('displays baseline comparison correctly', async () => {
    const mockSummary = {
      totalRuns: 15,
      avgDuration: 200,
      avgDurationMinutes: 3.33,
      avgCacheHitRate: 75,
      baseline: {
        expectedDurationRange: [90, 150],
        expectedImprovement: 60,
        actualPerformance: 'below-expectations'
      },
      alerts: [],
      trend: 'stable',
      recentAvgDuration: 200
    }

    ;(fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockSummary,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })

    render(<CIPerformanceDashboard />)

    await waitFor(() => {
      expect(screen.getByText('🎯 PR #19 最適化効果')).toBeInTheDocument()
    })

    expect(screen.getByText('4-6 分')).toBeInTheDocument()
    expect(screen.getByText('1.5-2.5 分')).toBeInTheDocument()
    expect(screen.getByText(/below expectations/)).toBeInTheDocument()
  })
})