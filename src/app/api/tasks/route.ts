import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { prisma } from '@/lib/prisma'
import { TaskStatus, Priority, Importance } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const status = searchParams.get('status')
    
    const whereClause: any = {
      userId: session.user.id,
    }
    
    if (date) {
      const targetDate = new Date(date)
      const nextDay = new Date(targetDate)
      nextDay.setDate(nextDay.getDate() + 1)
      
      whereClause.plannedDate = {
        gte: targetDate,
        lt: nextDay,
      }
    }
    
    if (status) {
      whereClause.status = status as TaskStatus
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        routine: {
          select: {
            id: true,
            title: true,
          },
        },
        records: true,
        _count: {
          select: {
            records: true,
          },
        },
      },
      orderBy: [
        { plannedStartTime: 'asc' },
        { createdAt: 'asc' },
      ],
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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
      priority = 'MEDIUM',
      importance = 'MEDIUM',
      tags = [],
      routineId,
    } = body

    if (!title || !plannedDate || !estimatedMinutes) {
      return NextResponse.json(
        { error: 'Title, plannedDate, and estimatedMinutes are required' },
        { status: 400 }
      )
    }

    const task = await prisma.task.create({
      data: {
        userId: session.user.id,
        title,
        description,
        category,
        plannedDate: new Date(plannedDate),
        plannedStartTime: plannedStartTime ? new Date(plannedStartTime) : null,
        estimatedMinutes: parseInt(estimatedMinutes),
        priority: priority as Priority,
        importance: importance as Importance,
        tags,
        routineId,
      },
      include: {
        routine: {
          select: {
            id: true,
            title: true,
          },
        },
        records: true,
        _count: {
          select: {
            records: true,
          },
        },
      },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}