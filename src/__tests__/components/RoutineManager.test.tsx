import { render, screen, waitFor } from '@testing-library/react'
import RoutineManager from '@/components/RoutineManager'

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('RoutineManager', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    // Always return empty array to avoid complex async state management
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    })
  })

  it('renders routine manager with basic UI elements', async () => {
    render(<RoutineManager />)

    await waitFor(() => {
      expect(screen.getByText('ルーティン管理')).toBeInTheDocument()
    })
    
    expect(screen.getByText('アクティブなルーティン')).toBeInTheDocument()
    expect(screen.getByText('今日の生成済み')).toBeInTheDocument()
    expect(screen.getByText('完了率')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '新しいルーティン' })).toBeInTheDocument()
  })
})