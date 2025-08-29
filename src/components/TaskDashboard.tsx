'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { TaskList } from './TaskList'
import { TaskForm } from './TaskForm'
import { TaskTimer } from './TaskTimer'
import { DailyStats } from './DailyStats'

interface Task {
  id: string
  title: string
  description?: string
  category?: string
  plannedDate: string
  plannedStartTime?: string
  estimatedMinutes: number
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  importance: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'PENDING' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED'
  actualStartTime?: string
  actualEndTime?: string
  actualMinutes?: number
  interruptions: number
  tags: string[]
  notes?: string
  routine?: {
    id: string
    title: string
  }
  records: any[]
  _count: {
    records: number
  }
}

export function TaskDashboard() {
  const { data: session } = useSession()
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [loading, setLoading] = useState(true)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)

  const fetchTasks = async (date?: string) => {
    try {
      const url = new URL('/api/tasks', window.location.origin)
      if (date) url.searchParams.set('date', date)
      
      const response = await fetch(url.toString())
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks(selectedDate)
  }, [selectedDate])

  const handleDateChange = (date: string) => {
    setSelectedDate(date)
    setLoading(true)
  }

  const handleTaskCreate = async (taskData: any) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...taskData,
          plannedDate: selectedDate,
        }),
      })

      if (response.ok) {
        await fetchTasks(selectedDate)
        setShowTaskForm(false)
      }
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }

  const handleTaskUpdate = async (taskId: string, updates: any) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        await fetchTasks(selectedDate)
      }
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  const handleTaskDelete = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchTasks(selectedDate)
      }
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  const handleStartTask = (taskId: string) => {
    setActiveTaskId(taskId)
    handleTaskUpdate(taskId, {
      status: 'IN_PROGRESS',
      actualStartTime: new Date().toISOString(),
    })
  }

  const handlePauseTask = (taskId: string) => {
    setActiveTaskId(null)
    handleTaskUpdate(taskId, { status: 'PAUSED' })
  }

  const handleCompleteTask = (taskId: string, actualMinutes: number) => {
    setActiveTaskId(null)
    handleTaskUpdate(taskId, {
      status: 'COMPLETED',
      actualEndTime: new Date().toISOString(),
      actualMinutes,
    })
  }

  const today = new Date().toISOString().split('T')[0]
  const isToday = selectedDate === today

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            タスクスケジューラー
          </h1>
          <p className="text-gray-600">
            こんにちは、{session?.user?.name || session?.user?.email}さん
          </p>
        </div>
        <button
          onClick={() => signOut()}
          className="text-gray-500 hover:text-gray-700"
        >
          サインアウト
        </button>
      </div>

      {/* Date Selector & Stats */}
      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-4 mb-4">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {!isToday && (
                <button
                  onClick={() => handleDateChange(today)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  今日に戻る
                </button>
              )}
            </div>
            <DailyStats tasks={tasks} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {new Date(selectedDate).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long',
                })}
                のタスク
              </h2>
              <button
                onClick={() => setShowTaskForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                ＋ 新しいタスク
              </button>
            </div>
            <div className="p-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <TaskList
                  tasks={tasks}
                  onTaskUpdate={handleTaskUpdate}
                  onTaskDelete={handleTaskDelete}
                  onTaskStart={handleStartTask}
                  onTaskPause={handlePauseTask}
                  onTaskComplete={handleCompleteTask}
                  activeTaskId={activeTaskId}
                />
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timer */}
          {activeTaskId && (
            <TaskTimer
              task={tasks.find(t => t.id === activeTaskId)!}
              onPause={() => handlePauseTask(activeTaskId)}
              onComplete={(minutes) => handleCompleteTask(activeTaskId, minutes)}
            />
          )}
          
          {/* Quick Add */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-3">クイック追加</h3>
            <p className="text-gray-600 text-sm">
              よく使うタスクやルーティンから素早く追加できます。
            </p>
            <button
              onClick={() => setShowTaskForm(true)}
              className="w-full mt-3 border-2 border-dashed border-gray-300 rounded-md py-3 text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors"
            >
              タスクを追加
            </button>
          </div>
        </div>
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          onSubmit={handleTaskCreate}
          onCancel={() => setShowTaskForm(false)}
          selectedDate={selectedDate}
        />
      )}
    </div>
  )
}