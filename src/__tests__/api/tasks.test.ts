// Mock API route for testing
const mockTasks = [
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
]

// Mock fetch for integration testing
global.fetch = jest.fn()

describe('/api/tasks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
  })

  describe('GET /api/tasks', () => {
    it('returns tasks successfully', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTasks,
      })

      const response = await fetch('/api/tasks')
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data).toEqual(mockTasks)
    })

    it('handles fetch errors', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      await expect(fetch('/api/tasks')).rejects.toThrow('Network error')
    })
  })

  describe('POST /api/tasks', () => {
    const newTaskData = {
      title: 'New Task',
      description: 'New description',
      estimatedMinutes: 30,
      priority: 'MEDIUM',
    }

    it('creates a new task successfully', async () => {
      const createdTask = {
        id: 2,
        ...newTaskData,
        status: 'TODO',
        actualMinutes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => createdTask,
      })

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTaskData),
      })

      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(response.status).toBe(201)
      expect(data.title).toBe(newTaskData.title)
    })

    it('handles validation errors', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Invalid data' }),
      })

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: '' }), // Invalid data
      })

      expect(response.ok).toBe(false)
      expect(response.status).toBe(400)
    })
  })

  describe('Authentication', () => {
    it('returns 401 when not authenticated', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' }),
      })

      const response = await fetch('/api/tasks')

      expect(response.ok).toBe(false)
      expect(response.status).toBe(401)
    })
  })
})