import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../../auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ルーティンからタスクを生成
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const routineId = resolvedParams.id
    const body = await request.json()
    const { plannedDate } = body

    // ルーティン情報を取得
    const routine = await prisma.routine.findFirst({
      where: {
        id: routineId,
        userId: session.user.id,
      },
    })

    if (!routine) {
      return NextResponse.json({ error: 'Routine not found' }, { status: 404 })
    }

    // 同日の同じルーティンタスクが既に存在するかチェック
    const existingTask = await prisma.task.findFirst({
      where: {
        userId: session.user.id,
        routineId: routineId,
        plannedDate: new Date(plannedDate),
      },
    })

    if (existingTask) {
      return NextResponse.json(
        { error: 'Task for this routine already exists for the specified date' },
        { status: 409 }
      )
    }

    // タスクを作成
    const task = await prisma.task.create({
      data: {
        userId: session.user.id,
        routineId: routineId,
        title: routine.title,
        description: routine.description,
        estimatedMinutes: routine.estimatedMinutes,
        priority: 'MEDIUM', // デフォルト優先度
        importance: 'MEDIUM', // デフォルト重要度
        plannedDate: new Date(plannedDate),
        status: 'PENDING',
      },
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error generating task from routine:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}