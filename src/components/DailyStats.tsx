'use client'

interface Task {
  id: string
  status: 'PENDING' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED'
  estimatedMinutes: number
  actualMinutes?: number
  interruptions: number
}

interface DailyStatsProps {
  tasks: Task[]
}

export function DailyStats({ tasks }: DailyStatsProps) {
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(task => task.status === 'COMPLETED').length
  const inProgressTasks = tasks.filter(task => ['IN_PROGRESS', 'PAUSED'].includes(task.status)).length
  const pendingTasks = tasks.filter(task => task.status === 'PENDING').length

  const totalEstimatedMinutes = tasks.reduce((sum, task) => sum + task.estimatedMinutes, 0)
  const totalActualMinutes = tasks
    .filter(task => task.actualMinutes)
    .reduce((sum, task) => sum + (task.actualMinutes || 0), 0)

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  
  const totalInterruptions = tasks.reduce((sum, task) => sum + task.interruptions, 0)
  const avgInterruptions = totalTasks > 0 ? (totalInterruptions / totalTasks).toFixed(1) : '0'

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    
    if (hours > 0) {
      return `${hours}時間${mins}分`
    }
    return `${mins}分`
  }

  const getCompletionColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600'
    if (rate >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* タスク完了率 */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="text-xs text-gray-500 mb-1">完了率</div>
        <div className={`text-2xl font-bold ${getCompletionColor(completionRate)}`}>
          {completionRate}%
        </div>
        <div className="text-xs text-gray-600">
          {completedTasks}/{totalTasks} 個
        </div>
      </div>

      {/* 時間効率 */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="text-xs text-gray-500 mb-1">時間効率</div>
        <div className="text-2xl font-bold text-blue-600">
          {totalActualMinutes > 0 && totalEstimatedMinutes > 0
            ? Math.round((totalEstimatedMinutes / totalActualMinutes) * 100)
            : 0}%
        </div>
        <div className="text-xs text-gray-600">
          実績/予定
        </div>
      </div>

      {/* 実行時間 */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="text-xs text-gray-500 mb-1">実行時間</div>
        <div className="text-lg font-bold text-purple-600">
          {formatTime(totalActualMinutes)}
        </div>
        <div className="text-xs text-gray-600">
          予定: {formatTime(totalEstimatedMinutes)}
        </div>
      </div>

      {/* 中断率 */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="text-xs text-gray-500 mb-1">平均中断</div>
        <div className="text-2xl font-bold text-orange-600">
          {avgInterruptions}
        </div>
        <div className="text-xs text-gray-600">
          回/タスク
        </div>
      </div>

      {/* 詳細統計（全幅） */}
      <div className="col-span-2 lg:col-span-4 bg-gray-50 rounded-lg p-3">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-sm text-gray-500">待機中</div>
            <div className="text-lg font-bold text-purple-600">{pendingTasks}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">実行中</div>
            <div className="text-lg font-bold text-blue-600">{inProgressTasks}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">完了済み</div>
            <div className="text-lg font-bold text-green-600">{completedTasks}</div>
          </div>
        </div>
      </div>
    </div>
  )
}