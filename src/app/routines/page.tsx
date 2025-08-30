import { Metadata } from 'next'
import RoutineManager from '../../components/RoutineManager'

export const metadata: Metadata = {
  title: 'ルーティン管理 - タスクスケジューラー',
  description: '繰り返しタスクの管理とスケジューリング',
}

export default function RoutinesPage() {
  return <RoutineManager />
}