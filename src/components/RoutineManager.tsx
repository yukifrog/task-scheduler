'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface Routine {
  id: string
  title: string
  description: string | null
  repeatType: 'DAILY' | 'WEEKLY' | 'MONTHLY'
  repeatInterval: number
  estimatedMinutes: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface NewRoutine {
  title: string
  description: string
  repeatType: 'DAILY' | 'WEEKLY' | 'MONTHLY'
  repeatInterval: number
  estimatedMinutes: number
}

export default function RoutineManager() {
  const { data: session } = useSession()
  const [routines, setRoutines] = useState<Routine[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newRoutine, setNewRoutine] = useState<NewRoutine>({
    title: '',
    description: '',
    repeatType: 'DAILY',
    repeatInterval: 1,
    estimatedMinutes: 60,
  })

  // ルーティン一覧を取得
  const fetchRoutines = async () => {
    try {
      const response = await fetch('/api/routines')
      if (response.ok) {
        const data = await response.json()
        setRoutines(data)
      }
    } catch (error) {
      console.error('Error fetching routines:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchRoutines()
    }
  }, [session])

  // ルーティン作成
  const handleCreateRoutine = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/routines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRoutine),
      })

      if (response.ok) {
        const createdRoutine = await response.json()
        setRoutines([createdRoutine, ...routines])
        setNewRoutine({
          title: '',
          description: '',
          repeatType: 'DAILY',
          repeatInterval: 1,
          estimatedMinutes: 60,
        })
        setShowForm(false)
      }
    } catch (error) {
      console.error('Error creating routine:', error)
    }
  }

  // ルーティンからタスクを生成
  const generateTask = async (routineId: string) => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const response = await fetch(`/api/routines/${routineId}/generate-task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plannedDate: today }),
      })

      if (response.ok) {
        alert('タスクが生成されました！')
      } else if (response.status === 409) {
        alert('今日のタスクは既に生成済みです')
      }
    } catch (error) {
      console.error('Error generating task:', error)
      alert('タスクの生成に失敗しました')
    }
  }

  const getRepeatTypeLabel = (type: string, interval: number) => {
    switch (type) {
      case 'DAILY':
        return interval === 1 ? '毎日' : `${interval}日ごと`
      case 'WEEKLY':
        return interval === 1 ? '毎週' : `${interval}週間ごと`
      case 'MONTHLY':
        return interval === 1 ? '毎月' : `${interval}ヶ月ごと`
      default:
        return type
    }
  }

  if (!session) {
    return <div>ログインしてください</div>
  }

  if (isLoading) {
    return <div>読み込み中...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">ルーティン管理</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          {showForm ? 'キャンセル' : '新しいルーティン'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">新しいルーティンを作成</h2>
          <form onSubmit={handleCreateRoutine} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                タイトル
              </label>
              <input
                type="text"
                value={newRoutine.title}
                onChange={(e) => setNewRoutine({ ...newRoutine, title: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                説明
              </label>
              <textarea
                value={newRoutine.description}
                onChange={(e) => setNewRoutine({ ...newRoutine, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  繰り返し
                </label>
                <select
                  value={newRoutine.repeatType}
                  onChange={(e) => setNewRoutine({ 
                    ...newRoutine, 
                    repeatType: e.target.value as 'DAILY' | 'WEEKLY' | 'MONTHLY' 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="DAILY">毎日</option>
                  <option value="WEEKLY">毎週</option>
                  <option value="MONTHLY">毎月</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  間隔
                </label>
                <input
                  type="number"
                  min="1"
                  value={newRoutine.repeatInterval}
                  onChange={(e) => setNewRoutine({ 
                    ...newRoutine, 
                    repeatInterval: parseInt(e.target.value) 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  予想時間 (分)
                </label>
                <input
                  type="number"
                  min="1"
                  value={newRoutine.estimatedMinutes}
                  onChange={(e) => setNewRoutine({ 
                    ...newRoutine, 
                    estimatedMinutes: parseInt(e.target.value) 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              ルーティンを作成
            </button>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {routines.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            ルーティンがありません。新しいルーティンを作成してください。
          </div>
        ) : (
          routines.map((routine) => (
            <div key={routine.id} className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{routine.title}</h3>
                  {routine.description && (
                    <p className="text-gray-600 mt-1">{routine.description}</p>
                  )}
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span>{getRepeatTypeLabel(routine.repeatType, routine.repeatInterval)}</span>
                    <span>{routine.estimatedMinutes}分</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      routine.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {routine.isActive ? '有効' : '無効'}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => generateTask(routine.id)}
                    className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700 transition-colors"
                  >
                    タスク生成
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}