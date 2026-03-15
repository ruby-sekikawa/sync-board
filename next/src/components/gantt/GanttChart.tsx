import { Box, Typography, CircularProgress } from '@mui/material'
import type { Task as GanttTaskType } from 'gantt-task-react'
import { ViewMode } from 'gantt-task-react'
import dynamic from 'next/dynamic'
import type { Task } from '@/types'

// gantt-task-react は SSR 非対応のため dynamic import
const GanttReact = dynamic(
  () => import('gantt-task-react').then((mod) => ({ default: mod.Gantt })),
  { ssr: false, loading: () => <CircularProgress /> },
)

export function taskToGanttTask(task: Task): GanttTaskType {
  const start = new Date(task.created_at.slice(0, 10))
  const hasDueDate = !!task.due_date

  return {
    id: `task-${task.id}`,
    name: task.title,
    start,
    end: hasDueDate ? new Date(task.due_date!) : start,
    type: hasDueDate ? 'task' : 'milestone',
    progress: 0,
    isDisabled: false,
    styles: {
      progressColor:
        task.priority === 'high'
          ? '#ef5350'
          : task.priority === 'medium'
            ? '#ff9800'
            : '#66bb6a',
      progressSelectedColor: task.priority === 'high' ? '#c62828' : '#e65100',
    },
  }
}

export function tasksToGanttTasks(
  tasks: Task[],
  { includeMilestones = false }: { includeMilestones?: boolean } = {},
): GanttTaskType[] {
  return tasks
    .filter((t) => includeMilestones || !!t.due_date)
    .map(taskToGanttTask)
}

interface Props {
  tasks: Task[]
  onDateChange?: (taskId: number, dueDate: string) => void
}

export default function GanttChart({ tasks, onDateChange }: Props) {
  const ganttTasks = tasksToGanttTasks(tasks, { includeMilestones: false })

  if (ganttTasks.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography color="text.secondary">
          期日が設定されているタスクがありません
        </Typography>
      </Box>
    )
  }

  const handleDateChange = (task: GanttTaskType) => {
    const id = Number(task.id.replace('task-', ''))
    const dueDate = task.end.toISOString().slice(0, 10)
    onDateChange?.(id, dueDate)
  }

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <GanttReact
        tasks={ganttTasks}
        viewMode={ViewMode.Week}
        onDateChange={handleDateChange}
        listCellWidth="200px"
        columnWidth={65}
        locale="ja-JP"
      />
    </Box>
  )
}
