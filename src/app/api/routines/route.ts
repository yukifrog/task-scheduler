import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ルーティン一覧取得
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const routines = await prisma.routine.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(routines)
  } catch (error) {
    console.error('Error fetching routines:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// ルーティン作成
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, repeatType, repeatInterval, estimatedMinutes } = body

    const routine = await prisma.routine.create({
      data: {
        userId: session.user.id,
        title,
        description: description || null,
        repeatType,
        repeatInterval: repeatInterval || 1,
        estimatedMinutes: estimatedMinutes || 60,
      },
    })

    return NextResponse.json(routine)
  } catch (error) {
    console.error('Error creating routine:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}