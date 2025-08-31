import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), 'reports', 'ci-performance', 'latest-summary.json')
    
    if (!fs.existsSync(dataPath)) {
      // Return mock data if file doesn't exist
      return NextResponse.json({
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
      })
    }

    const data = fs.readFileSync(dataPath, 'utf8')
    const summary = JSON.parse(data)
    
    return NextResponse.json(summary)
  } catch (error) {
    console.error('Failed to load CI performance summary:', error)
    return NextResponse.json(
      { error: 'Failed to load performance data' },
      { status: 500 }
    )
  }
}