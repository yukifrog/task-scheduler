import { createMocks } from 'node-mocks-http'
import handler from '@/app/api/tasks/route'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  task: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  user: {
    findFirst: jest.fn(),
  },
}))

// Mock NextAuth
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}))

describe('/api/tasks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('returns tasks for authenticated user', async () => {
      const { req, res } = createMocks({
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
      prisma.task.findMany.mockResolvedValueOnce([
        {
          id: 1,
          title: 'Test Task',
          description: 'Test description',
          status: 'TODO',
          priority: 'HIGH',
          estimatedMinutes: 60,
          actualMinutes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ])

      const response = await handler.GET(req)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveLength(1)
      expect(data[0].title).toBe('Test Task')
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
    it('creates a new task', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          title: 'New Task',
          description: 'New description',
          estimatedMinutes: 30,
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
      
      const newTask = {
        id: 2,
        title: 'New Task',
        description: 'New description',
        status: 'TODO',
        priority: 'MEDIUM',
        estimatedMinutes: 30,
        actualMinutes: null,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      prisma.task.create.mockResolvedValueOnce(newTask)

      const response = await handler.POST(req)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.title).toBe('New Task')
      expect(prisma.task.create).toHaveBeenCalledWith({
        data: {
          title: 'New Task',
          description: 'New description',
          estimatedMinutes: 30,
          priority: 'MEDIUM',
          status: 'TODO',
          userId: 1,
        },
      })
    })

    it('validates required fields', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          description: 'Missing title',
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
          title: 'Test Task',
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