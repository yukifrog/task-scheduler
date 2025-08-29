import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { prisma } from '@/lib/prisma'
import { TaskStatus, Priority, Importance } from '@prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const task = await prisma.task.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        routine: {
          select: {
            id: true,
            title: true,
            estimatedMinutes: true,
          },
        },
        records: {
          orderBy: {
            startTime: 'asc',
          },
        },
        _count: {
          select: {
            records: true,
          },
        },
      },
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      category,
      plannedDate,
      plannedStartTime,
      estimatedMinutes,
      priority,
      importance,
      status,
      tags,
      notes,
      actualStartTime,
      actualEndTime,
      actualMinutes,
      interruptions,
    } = body

    // タスクの所有者確認
    const existingTask = await prisma.task.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const updateData: any = {}
    
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (category !== undefined) updateData.category = category
    if (plannedDate !== undefined) updateData.plannedDate = new Date(plannedDate)
    if (plannedStartTime !== undefined) {
      updateData.plannedStartTime = plannedStartTime ? new Date(plannedStartTime) : null
    }
    if (estimatedMinutes !== undefined) updateData.estimatedMinutes = parseInt(estimatedMinutes)
    if (priority !== undefined) updateData.priority = priority as Priority
    if (importance !== undefined) updateData.importance = importance as Importance
    if (status !== undefined) updateData.status = status as TaskStatus
    if (tags !== undefined) updateData.tags = tags
    if (notes !== undefined) updateData.notes = notes
    if (actualStartTime !== undefined) {
      updateData.actualStartTime = actualStartTime ? new Date(actualStartTime) : null
    }
    if (actualEndTime !== undefined) {
      updateData.actualEndTime = actualEndTime ? new Date(actualEndTime) : null
    }
    if (actualMinutes !== undefined) updateData.actualMinutes = actualMinutes
    if (interruptions !== undefined) updateData.interruptions = interruptions

    const task = await prisma.task.update({
      where: { id: params.id },
      data: updateData,
      include: {
        routine: {
          select: {
            id: true,
            title: true,
            estimatedMinutes: true,
          },
        },
        records: {
          orderBy: {
            startTime: 'asc',
          },
        },
        _count: {
          select: {
            records: true,
          },
        },
      },
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // タスクの所有者確認
    const existingTask = await prisma.task.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    await prisma.task.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Task deleted successfully' })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}