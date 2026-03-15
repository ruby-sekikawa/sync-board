import {
  taskToGanttTask,
  tasksToGanttTasks,
} from '@/components/gantt/GanttChart'
import type { Task } from '@/types'

const baseTask: Task = {
  id: 1,
  column_id: 1,
  board_id: 1,
  title: 'テストタスク',
  description: null,
  assignee_id: null,
  assignee: null,
  due_date: '2026-03-31',
  priority: 'medium',
  position: 65536,
  created_by_user_id: 1,
  created_at: '2026-03-01T00:00:00.000Z',
  updated_at: '2026-03-01T00:00:00.000Z',
}

describe('taskToGanttTask', () => {
  it('due_dateがある場合はtaskとして変換する', () => {
    const result = taskToGanttTask(baseTask)
    expect(result.id).toBe('task-1')
    expect(result.name).toBe('テストタスク')
    expect(result.type).toBe('task')
    expect(result.end).toEqual(new Date('2026-03-31'))
  })

  it('due_dateがない場合はmilestoneとして変換する', () => {
    const result = taskToGanttTask({ ...baseTask, due_date: null })
    expect(result.type).toBe('milestone')
  })

  it('created_atをstartとして使用する', () => {
    const result = taskToGanttTask(baseTask)
    expect(result.start).toEqual(new Date('2026-03-01'))
  })

  it('progressは0固定', () => {
    const result = taskToGanttTask(baseTask)
    expect(result.progress).toBe(0)
  })
})

describe('tasksToGanttTasks', () => {
  it('due_dateがないタスクを除外する', () => {
    const tasks: Task[] = [
      baseTask,
      { ...baseTask, id: 2, due_date: null },
      { ...baseTask, id: 3, due_date: '2026-04-01' },
    ]
    const result = tasksToGanttTasks(tasks, { includeMilestones: false })
    expect(result).toHaveLength(2)
    expect(result.map((t) => t.id)).toEqual(['task-1', 'task-3'])
  })

  it('includeMilestones=trueの場合はdue_dateなしも含める', () => {
    const tasks: Task[] = [baseTask, { ...baseTask, id: 2, due_date: null }]
    const result = tasksToGanttTasks(tasks, { includeMilestones: true })
    expect(result).toHaveLength(2)
  })
})
