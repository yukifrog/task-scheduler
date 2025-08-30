import { createMocks } from 'node-mocks-http'
import handler from '@/app/api/routines/route'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  routine: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findFirst: jest.fn(),
  },
  task: {
    create: jest.fn(),
  },
  user: {
    findFirst: jest.fn(),
  },
}))

// Mock NextAuth
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}))

describe('/api/routines', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('returns routines for authenticated user', async () => {
      const { req } = createMocks({
        method: 'GET',
      })

      // Mock authentication
      const getServerSession = require('next-auth/next').getServerSession
      getServerSession.mockResolvedValueOnce({
        user: { email: 'test@example.com' },
      })

      // Mock database response
      const prisma = require('@/lib/prisma')
      prisma.user.findFirst.mockResolvedValueOnce({ id: 1 })
      prisma.routine.findMany.mockResolvedValueOnce([
        {
          id: 1,
          name: 'Daily Exercise',
          description: 'Morning workout',
          frequency: 'DAILY',
          estimatedMinutes: 30,
          priority: 'HIGH',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ])

      const response = await handler.GET(req)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveLength(1)
      expect(data[0].name).toBe('Daily Exercise')
    })

    it('returns 401 when user is not authenticated', async () => {
      const { req } = createMocks({
        method: 'GET',
      })

      // Mock no authentication
      const getServerSession = require('next-auth/next').getServerSession
      getServerSession.mockResolvedValueOnce(null)

      const response = await handler.GET(req)

      expect(response.status).toBe(401)
    })
  })

  describe('POST', () => {
    it('creates a new routine', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          name: 'New Routine',
          description: 'New routine description',
          frequency: 'WEEKLY',
          estimatedMinutes: 60,
          priority: 'MEDIUM',
        },
      })

      // Mock authentication
      const getServerSession = require('next-auth/next').getServerSession
      getServerSession.mockResolvedValueOnce({
        user: { email: 'test@example.com' },
      })

      // Mock database responses
      const prisma = require('@/lib/prisma')
      prisma.user.findFirst.mockResolvedValueOnce({ id: 1 })
      
      const newRoutine = {
        id: 2,
        name: 'New Routine',
        description: 'New routine description',
        frequency: 'WEEKLY',
        estimatedMinutes: 60,
        priority: 'MEDIUM',
        isActive: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      prisma.routine.create.mockResolvedValueOnce(newRoutine)

      const response = await handler.POST(req)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.name).toBe('New Routine')
      expect(prisma.routine.create).toHaveBeenCalledWith({
        data: {
          name: 'New Routine',
          description: 'New routine description',
          frequency: 'WEEKLY',
          estimatedMinutes: 60,
          priority: 'MEDIUM',
          isActive: true,
          userId: 1,
        },
      })
    })

    it('validates required fields', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          description: 'Missing name',
        },
      })

      // Mock authentication
      const getServerSession = require('next-auth/next').getServerSession
      getServerSession.mockResolvedValueOnce({
        user: { email: 'test@example.com' },
      })

      const response = await handler.POST(req)

      expect(response.status).toBe(400)
    })

    it('validates frequency enum', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          name: 'Test Routine',
          frequency: 'INVALID_FREQUENCY',
          estimatedMinutes: 30,
          priority: 'HIGH',
        },
      })

      // Mock authentication
      const getServerSession = require('next-auth/next').getServerSession
      getServerSession.mockResolvedValueOnce({
        user: { email: 'test@example.com' },
      })

      const response = await handler.POST(req)

      expect(response.status).toBe(400)
    })

    it('validates priority enum', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          name: 'Test Routine',
          frequency: 'DAILY',
          estimatedMinutes: 30,
          priority: 'INVALID_PRIORITY',
        },
      })

      // Mock authentication
      const getServerSession = require('next-auth/next').getServerSession
      getServerSession.mockResolvedValueOnce({
        user: { email: 'test@example.com' },
      })

      const response = await handler.POST(req)

      expect(response.status).toBe(400)
    })

    it('returns 401 when user is not authenticated', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          name: 'Test Routine',
        },
      })

      // Mock no authentication
      const getServerSession = require('next-auth/next').getServerSession
      getServerSession.mockResolvedValueOnce(null)

      const response = await handler.POST(req)

      expect(response.status).toBe(401)
    })
  })
})

describe('/api/routines/[id]/generate-task', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('generates task from routine', async () => {
    const { req } = createMocks({
      method: 'POST',
    })

    // Mock authentication
    const getServerSession = require('next-auth/next').getServerSession
    getServerSession.mockResolvedValueOnce({
      user: { email: 'test@example.com' },
    })

    // Mock database responses
    const prisma = require('@/lib/prisma')
    prisma.user.findFirst.mockResolvedValueOnce({ id: 1 })
    
    const routine = {
      id: 1,
      name: 'Daily Exercise',
      description: 'Morning workout',
      frequency: 'DAILY',
      estimatedMinutes: 30,
      priority: 'HIGH',
      isActive: true,
      userId: 1,
    }
    
    prisma.routine.findFirst.mockResolvedValueOnce(routine)
    
    const generatedTask = {
      id: 1,
      title: 'Daily Exercise',
      description: 'Morning workout (ルーティンから生成)',
      estimatedMinutes: 30,
      priority: 'HIGH',
      status: 'TODO',
      userId: 1,
      routineId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    prisma.task.create.mockResolvedValueOnce(generatedTask)

    // Mock the dynamic route handler
    const generateHandler = require('@/app/api/routines/[id]/generate-task/route')
    const response = await generateHandler.POST(req, { params: { id: '1' } })
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.message).toBe('タスクが生成されました')
    expect(data.task.title).toBe('Daily Exercise')
  })

  it('returns 404 when routine not found', async () => {
    const { req } = createMocks({
      method: 'POST',
    })

    // Mock authentication
    const getServerSession = require('next-auth/next').getServerSession
    getServerSession.mockResolvedValueOnce({
      user: { email: 'test@example.com' },
    })

    // Mock database responses
    const prisma = require('@/lib/prisma')
    prisma.user.findFirst.mockResolvedValueOnce({ id: 1 })
    prisma.routine.findFirst.mockResolvedValueOnce(null)

    const generateHandler = require('@/app/api/routines/[id]/generate-task/route')
    const response = await generateHandler.POST(req, { params: { id: '999' } })

    expect(response.status).toBe(404)
  })

  it('returns 401 when user is not authenticated', async () => {
    const { req } = createMocks({
      method: 'POST',
    })

    // Mock no authentication
    const getServerSession = require('next-auth/next').getServerSession
    getServerSession.mockResolvedValueOnce(null)

    const generateHandler = require('@/app/api/routines/[id]/generate-task/route')
    const response = await generateHandler.POST(req, { params: { id: '1' } })

    expect(response.status).toBe(401)
  })
})