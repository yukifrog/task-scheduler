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

    expect(screen.getByLabelText('タイトル *')).toBeInTheDocument()
    expect(screen.getByLabelText('説明')).toBeInTheDocument()
    expect(screen.getByLabelText('見積もり時間（分）*')).toBeInTheDocument()
    expect(screen.getByLabelText('優先度')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'タスクを作成' })).toBeInTheDocument()
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    render(
      <TaskForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
        selectedDate={selectedDate} 
      />
    )

    const titleInput = screen.getByLabelText('タイトル *')
    const descriptionInput = screen.getByLabelText('説明')
    const estimatedMinutesInput = screen.getByLabelText('見積もり時間（分）*')
    const prioritySelect = screen.getByLabelText('優先度')

    await user.type(titleInput, 'Test Task')
    await user.type(descriptionInput, 'Test description')
    await user.clear(estimatedMinutesInput)
    await user.type(estimatedMinutesInput, '60')
    await user.selectOptions(prioritySelect, 'HIGH')

    const submitButton = screen.getByRole('button', { name: 'タスクを作成' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Test Task',
        description: 'Test description',
        estimatedMinutes: 60,
        priority: 'HIGH',
      }))
    })
  })

  it('calls onCancel when cancel button is clicked', async () => {
    render(
      <TaskForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
        selectedDate={selectedDate} 
      />
    )

    const cancelButton = screen.getByRole('button', { name: 'キャンセル' })
    fireEvent.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })

  it('validates required title field', async () => {
    render(
      <TaskForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
        selectedDate={selectedDate} 
      />
    )

    const submitButton = screen.getByRole('button', { name: 'タスクを作成' })
    fireEvent.click(submitButton)

    // Since form validation is handled by HTML5, we just check that submit wasn't called
    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })
  })

  it('processes tags correctly', async () => {
    const user = userEvent.setup()
    render(
      <TaskForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
        selectedDate={selectedDate} 
      />
    )

    const titleInput = screen.getByLabelText('タイトル *')
    const tagsInput = screen.getByLabelText('タグ')

    await user.type(titleInput, 'Test Task')
    await user.type(tagsInput, 'tag1, tag2, tag3')

    const submitButton = screen.getByRole('button', { name: 'タスクを作成' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
        tags: ['tag1', 'tag2', 'tag3'],
      }))
    })
  })
})