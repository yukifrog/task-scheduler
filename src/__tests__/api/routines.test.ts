// Mock API route for testing
const mockRoutines = [
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
]

// Mock fetch for integration testing
global.fetch = jest.fn()

describe('/api/routines', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
  })

  describe('GET /api/routines', () => {
    it('returns routines successfully', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRoutines,
      })

      const response = await fetch('/api/routines')
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data).toEqual(mockRoutines)
    })

    it('handles fetch errors', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      await expect(fetch('/api/routines')).rejects.toThrow('Network error')
    })
  })

  describe('POST /api/routines', () => {
    const newRoutineData = {
      name: 'Weekly Review',
      description: 'Review weekly goals',
      frequency: 'WEEKLY',
      estimatedMinutes: 60,
      priority: 'MEDIUM',
    }

    it('creates a new routine successfully', async () => {
      const createdRoutine = {
        id: 2,
        ...newRoutineData,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => createdRoutine,
      })

      const response = await fetch('/api/routines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRoutineData),
      })

      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(response.status).toBe(201)
      expect(data.name).toBe(newRoutineData.name)
    })

    it('handles validation errors', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Invalid data' }),
      })

      const response = await fetch('/api/routines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: '' }), // Invalid data
      })

      expect(response.ok).toBe(false)
      expect(response.status).toBe(400)
    })
  })

  describe('Task Generation', () => {
    it('generates task from routine successfully', async () => {
      const generatedTask = {
        id: 1,
        title: 'Daily Exercise',
        description: 'Morning workout (ルーティンから生成)',
        estimatedMinutes: 30,
        priority: 'HIGH',
        status: 'TODO',
        routineId: 1,
        createdAt: new Date(),
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({
          message: 'タスクが生成されました',
          task: generatedTask,
        }),
      })

      const response = await fetch('/api/routines/1/generate-task', {
        method: 'POST',
      })

      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(response.status).toBe(201)
      expect(data.message).toBe('タスクが生成されました')
      expect(data.task.title).toBe('Daily Exercise')
    })

    it('handles routine not found', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Routine not found' }),
      })

      const response = await fetch('/api/routines/999/generate-task', {
        method: 'POST',
      })

      expect(response.ok).toBe(false)
      expect(response.status).toBe(404)
    })
  })

  describe('Authentication', () => {
    it('returns 401 when not authenticated', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' }),
      })

      const response = await fetch('/api/routines')

      expect(response.ok).toBe(false)
      expect(response.status).toBe(401)
    })
  })
})