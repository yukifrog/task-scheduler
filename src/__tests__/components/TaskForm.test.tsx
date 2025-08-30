import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskForm } from '@/components/TaskForm'

describe('TaskForm', () => {
  const mockOnSubmit = jest.fn()
  const mockOnCancel = jest.fn()
  const selectedDate = '2024-01-01'

  beforeEach(() => {
    mockOnSubmit.mockClear()
    mockOnCancel.mockClear()
  })

  it('renders the task form with all fields', () => {
    render(
      <TaskForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
        selectedDate={selectedDate} 
      />
    )

    expect(screen.getByLabelText('タイトル')).toBeInTheDocument()
    expect(screen.getByLabelText('説明')).toBeInTheDocument()
    expect(screen.getByLabelText('予想時間 (分)')).toBeInTheDocument()
    expect(screen.getByLabelText('優先度')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'タスクを作成' })).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    render(<TaskForm onTaskCreated={mockOnTaskCreated} />)

    const submitButton = screen.getByRole('button', { name: 'タスクを作成' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('タイトルは必須です')).toBeInTheDocument()
    })
  })

  it('validates estimated minutes is a positive number', async () => {
    const user = userEvent.setup()
    render(<TaskForm onTaskCreated={mockOnTaskCreated} />)

    const titleInput = screen.getByLabelText('タイトル')
    const estimatedMinutesInput = screen.getByLabelText('予想時間 (分)')

    await user.type(titleInput, 'Test Task')
    await user.type(estimatedMinutesInput, '-10')

    const submitButton = screen.getByRole('button', { name: 'タスクを作成' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('予想時間は1以上の数値を入力してください')).toBeInTheDocument()
    })
  })

  it('creates a task successfully', async () => {
    const user = userEvent.setup()
    const mockTask = {
      id: 1,
      title: 'Test Task',
      description: 'Test description',
      estimatedMinutes: 60,
      priority: 'HIGH',
      status: 'TODO',
      createdAt: new Date().toISOString(),
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTask,
    })

    render(<TaskForm onTaskCreated={mockOnTaskCreated} />)

    const titleInput = screen.getByLabelText('タイトル')
    const descriptionInput = screen.getByLabelText('説明')
    const estimatedMinutesInput = screen.getByLabelText('予想時間 (分)')
    const prioritySelect = screen.getByLabelText('優先度')

    await user.type(titleInput, 'Test Task')
    await user.type(descriptionInput, 'Test description')
    await user.type(estimatedMinutesInput, '60')
    await user.selectOptions(prioritySelect, 'HIGH')

    const submitButton = screen.getByRole('button', { name: 'タスクを作成' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Test Task',
          description: 'Test description',
          estimatedMinutes: 60,
          priority: 'HIGH',
        }),
      })
    })

    await waitFor(() => {
      expect(mockOnTaskCreated).toHaveBeenCalledWith(mockTask)
    })
  })

  it('handles API error gracefully', async () => {
    const user = userEvent.setup()
    mockFetch.mockRejectedValueOnce(new Error('API Error'))

    render(<TaskForm onTaskCreated={mockOnTaskCreated} />)

    const titleInput = screen.getByLabelText('タイトル')
    await user.type(titleInput, 'Test Task')

    const submitButton = screen.getByRole('button', { name: 'タスクを作成' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('タスクの作成に失敗しました')).toBeInTheDocument()
    })
  })

  it('resets form after successful submission', async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, title: 'Test Task' }),
    })

    render(<TaskForm onTaskCreated={mockOnTaskCreated} />)

    const titleInput = screen.getByLabelText('タイトル')
    await user.type(titleInput, 'Test Task')

    const submitButton = screen.getByRole('button', { name: 'タスクを作成' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(titleInput).toHaveValue('')
    })
  })
})