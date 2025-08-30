import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RoutineManager from '@/components/RoutineManager'

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('RoutineManager', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('renders routine manager with statistics', () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    })

    render(<RoutineManager />)

    expect(screen.getByText('ルーティン管理')).toBeInTheDocument()
    expect(screen.getByText('アクティブなルーティン')).toBeInTheDocument()
    expect(screen.getByText('今日の生成済み')).toBeInTheDocument()
    expect(screen.getByText('完了率')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '新しいルーティン' })).toBeInTheDocument()
  })

  it('displays routines list', async () => {
    const mockRoutines = [
      {
        id: 1,
        name: 'Daily Exercise',
        description: 'Morning workout routine',
        frequency: 'DAILY',
        estimatedMinutes: 30,
        priority: 'HIGH',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        name: 'Weekly Review',
        description: 'Review weekly goals',
        frequency: 'WEEKLY',
        estimatedMinutes: 60,
        priority: 'MEDIUM',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockRoutines,
    })

    render(<RoutineManager />)

    await waitFor(() => {
      expect(screen.getByText('Daily Exercise')).toBeInTheDocument()
      expect(screen.getByText('Weekly Review')).toBeInTheDocument()
      expect(screen.getByText('DAILY')).toBeInTheDocument()
      expect(screen.getByText('WEEKLY')).toBeInTheDocument()
    })
  })

  it('opens new routine modal', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    })

    render(<RoutineManager />)

    const newRoutineButton = screen.getByRole('button', { name: '新しいルーティン' })
    fireEvent.click(newRoutineButton)

    await waitFor(() => {
      expect(screen.getByText('新しいルーティンを追加')).toBeInTheDocument()
      expect(screen.getByLabelText('名前')).toBeInTheDocument()
      expect(screen.getByLabelText('説明')).toBeInTheDocument()
      expect(screen.getByLabelText('頻度')).toBeInTheDocument()
      expect(screen.getByLabelText('予想時間 (分)')).toBeInTheDocument()
      expect(screen.getByLabelText('優先度')).toBeInTheDocument()
    })
  })

  it('creates a new routine', async () => {
    const user = userEvent.setup()
    
    // Mock initial fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    })

    // Mock create routine
    const newRoutine = {
      id: 1,
      name: 'Test Routine',
      description: 'Test description',
      frequency: 'DAILY',
      estimatedMinutes: 45,
      priority: 'HIGH',
      isActive: true,
      createdAt: new Date().toISOString(),
    }

    render(<RoutineManager />)

    // Open modal
    const newRoutineButton = screen.getByRole('button', { name: '新しいルーティン' })
    fireEvent.click(newRoutineButton)

    // Fill form
    await user.type(screen.getByLabelText('名前'), 'Test Routine')
    await user.type(screen.getByLabelText('説明'), 'Test description')
    await user.selectOptions(screen.getByLabelText('頻度'), 'DAILY')
    await user.type(screen.getByLabelText('予想時間 (分)'), '45')
    await user.selectOptions(screen.getByLabelText('優先度'), 'HIGH')

    // Mock successful creation
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => newRoutine,
    })

    // Mock refresh fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [newRoutine],
    })

    // Submit form
    const createButton = screen.getByRole('button', { name: 'ルーティンを作成' })
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/routines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test Routine',
          description: 'Test description',
          frequency: 'DAILY',
          estimatedMinutes: 45,
          priority: 'HIGH',
        }),
      })
    })
  })

  it('generates task from routine', async () => {
    const mockRoutines = [
      {
        id: 1,
        name: 'Daily Exercise',
        description: 'Morning workout routine',
        frequency: 'DAILY',
        estimatedMinutes: 30,
        priority: 'HIGH',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ]

    // Mock initial fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockRoutines,
    })

    render(<RoutineManager />)

    await waitFor(() => {
      expect(screen.getByText('Daily Exercise')).toBeInTheDocument()
    })

    // Mock task generation
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Task generated successfully' }),
    })

    const generateButton = screen.getByRole('button', { name: 'タスクを生成' })
    fireEvent.click(generateButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/routines/1/generate-task', {
        method: 'POST',
      })
    })
  })

  it('deletes a routine', async () => {
    const mockRoutines = [
      {
        id: 1,
        name: 'Daily Exercise',
        description: 'Morning workout routine',
        frequency: 'DAILY',
        estimatedMinutes: 30,
        priority: 'HIGH',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ]

    // Mock initial fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockRoutines,
    })

    render(<RoutineManager />)

    await waitFor(() => {
      expect(screen.getByText('Daily Exercise')).toBeInTheDocument()
    })

    // Mock deletion
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Routine deleted' }),
    })

    // Mock refresh after deletion
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    })

    const deleteButton = screen.getByRole('button', { name: '削除' })
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/routines/1', {
        method: 'DELETE',
      })
    })
  })
})