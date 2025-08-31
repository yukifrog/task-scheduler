import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), 'reports', 'ci-performance', 'latest-detailed.json')
    
    if (!fs.existsSync(dataPath)) {
      // Return mock data if file doesn't exist
      const mockData = Array.from({ length: 20 }, (_, i) => ({
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
      
      return NextResponse.json(mockData)
    }

    const data = fs.readFileSync(dataPath, 'utf8')
    const detailed = JSON.parse(data)
    
    return NextResponse.json(detailed)
  } catch (error) {
    console.error('Failed to load CI performance detailed data:', error)
    return NextResponse.json(
      { error: 'Failed to load performance data' },
      { status: 500 }
    )
  }
}