'use client'

interface Task {
  id: string
  title: string
  description?: string
  category?: string
  estimatedMinutes: number
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  importance: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'PENDING' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED'
  actualMinutes?: number
  interruptions: number
  tags: string[]
  notes?: string
  plannedStartTime?: string
}

interface TaskListProps {
  tasks: Task[]
  onTaskUpdate: (taskId: string, updates: Record<string, unknown>) => void
  onTaskDelete: (taskId: string) => void
  onTaskStart: (taskId: string) => void
  onTaskPause: (taskId: string) => void
  onTaskComplete: (taskId: string, minutes: number) => void
  activeTaskId: string | null
}

export function TaskList({ 
  tasks, 
  onTaskDelete, 
  onTaskStart, 
  onTaskPause, 
  onTaskComplete, 
  activeTaskId 
}: TaskListProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800'
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'LOW': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'PAUSED': return 'bg-yellow-100 text-yellow-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      case 'POSTPONED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-purple-100 text-purple-800'
    }
  }

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return ''
    return new Date(timeStr).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        この日のタスクはありません
      </div>
    )
  }

  const pendingTasks = tasks.filter(t => t.status === 'PENDING')
  const activeTasks = tasks.filter(t => ['IN_PROGRESS', 'PAUSED'].includes(t.status))
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED')
  const otherTasks = tasks.filter(t => !['PENDING', 'IN_PROGRESS', 'PAUSED', 'COMPLETED'].includes(t.status))

  const TaskItem = ({ task }: { task: Task }) => (
    <div 
      key={task.id}
      className={`border border-gray-200 rounded-lg p-4 mb-3 ${
        task.id === activeTaskId ? 'ring-2 ring-blue-500' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{task.title}</h3>
          {task.description && (
            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
          )}
        </div>
        <div className="flex gap-2 ml-4">
          <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
            {task.status}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-4">
          <span>予定: {task.estimatedMinutes}分</span>
          {task.plannedStartTime && (
            <span>開始: {formatTime(task.plannedStartTime)}</span>
          )}
          {task.actualMinutes && (
            <span>実績: {task.actualMinutes}分</span>
          )}
        </div>
        
        <div className="flex gap-2">
          {task.status === 'PENDING' && (
            <button
              onClick={() => onTaskStart(task.id)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              開始
            </button>
          )}
          
          {task.status === 'IN_PROGRESS' && (
            <>
              <button
                onClick={() => onTaskPause(task.id)}
                className="text-yellow-600 hover:text-yellow-800 text-sm"
              >
                一時停止
              </button>
              <button
                onClick={() => onTaskComplete(task.id, task.estimatedMinutes)}
                className="text-green-600 hover:text-green-800 text-sm"
              >
                完了
              </button>
            </>
          )}
          
          {task.status === 'PAUSED' && (
            <button
              onClick={() => onTaskStart(task.id)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              再開
            </button>
          )}
          
          <button
            onClick={() => onTaskDelete(task.id)}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            削除
          </button>
        </div>
      </div>

      {task.tags.length > 0 && (
        <div className="flex gap-1 mt-2">
          {task.tags.map((tag, index) => (
            <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      {activeTasks.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">実行中・一時停止中</h3>
          {activeTasks.map(task => <TaskItem key={task.id} task={task} />)}
        </div>
      )}

      {pendingTasks.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">待機中</h3>
          {pendingTasks.map(task => <TaskItem key={task.id} task={task} />)}
        </div>
      )}

      {completedTasks.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">完了済み</h3>
          {completedTasks.map(task => <TaskItem key={task.id} task={task} />)}
        </div>
      )}

      {otherTasks.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">その他</h3>
          {otherTasks.map(task => <TaskItem key={task.id} task={task} />)}
        </div>
      )}
    </div>
  )
}