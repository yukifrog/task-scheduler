'use client'

import { useState, useEffect } from 'react'

interface Task {
  id: string
  title: string
  estimatedMinutes: number
  actualStartTime?: string
}

interface TaskTimerProps {
  task: Task
  onPause: () => void
  onComplete: (minutes: number) => void
}

export function TaskTimer({ task, onPause, onComplete }: TaskTimerProps) {
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isRunning, setIsRunning] = useState(true)

  useEffect(() => {
    if (task.actualStartTime) {
      const startTime = new Date(task.actualStartTime).getTime()
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
    }
  }, [task.actualStartTime])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const elapsedMinutes = Math.floor(elapsedTime / 60)
  const progressPercentage = Math.min((elapsedMinutes / task.estimatedMinutes) * 100, 100)

  const handlePause = () => {
    setIsRunning(false)
    onPause()
  }

  const handleComplete = () => {
    setIsRunning(false)
    onComplete(elapsedMinutes)
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-3">実行中のタスク</h3>
      
      <div className="mb-4">
        <h4 className="font-medium text-gray-900 mb-2">{task.title}</h4>
        
        <div className="text-center mb-4">
          <div className="text-3xl font-mono font-bold text-blue-600 mb-1">
            {formatTime(elapsedTime)}
          </div>
          <div className="text-sm text-gray-600">
            予定: {task.estimatedMinutes}分
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              progressPercentage <= 100 ? 'bg-blue-600' : 'bg-red-600'
            }`}
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          ></div>
        </div>

        {progressPercentage > 100 && (
          <div className="text-sm text-red-600 text-center mb-2">
            予定時間を超過しています
          </div>
        )}

        <div className="text-center text-sm text-gray-600 mb-4">
          {elapsedMinutes} / {task.estimatedMinutes} 分経過
          {progressPercentage > 100 && (
            <span className="text-red-600">
              （+{elapsedMinutes - task.estimatedMinutes}分）
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handlePause}
          className="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 transition-colors"
        >
          一時停止
        </button>
        <button
          onClick={handleComplete}
          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
        >
          完了
        </button>
      </div>
      
      <div className="mt-3 text-xs text-gray-500 text-center">
        開始時刻: {task.actualStartTime ? new Date(task.actualStartTime).toLocaleTimeString('ja-JP', {
          hour: '2-digit',
          minute: '2-digit'
        }) : ''}
      </div>
    </div>
  )
}