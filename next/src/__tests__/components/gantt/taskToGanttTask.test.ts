import {
  taskToGanttTask,
  tasksToGanttTasks,
} from '@/components/gantt/GanttChart'
import type { Task } from '@/types'

const baseTask: Task = {
  id: 1,
  columnId: 1,
  boardId: 1,
  title: 'テストタスク',
  description: null,
  assigneeId: null,
  assignee: null,
  dueDate: '2026-03-31',
  priority: 'medium',
  position: 65536,
  startDate: '2026-03-01',
  createdByUserId: 1,
  createdAt: '2026-03-01T00:00:00.000Z',
  updatedAt: '2026-03-01T00:00:00.000Z',
}

describe('taskToGanttTask', () => {
  it('dueDateがある場合はtaskとして変換する', () => {
    const result = taskToGanttTask(baseTask)
    expect(result.id).toBe('task-1')
    expect(result.name).toBe('テストタスク')
    expect(result.type).toBe('task')
    expect(result.end).toEqual(new Date('2026-03-31'))
  })

  it('dueDateがない場合はmilestoneとして変換する', () => {
    const result = taskToGanttTask({ ...baseTask, dueDate: null })
    expect(result.type).toBe('milestone')
  })

  it('startDateをstartとして使用する', () => {
    const result = taskToGanttTask(baseTask)
    expect(result.start).toEqual(new Date('2026-03-01'))
  })

  it('startDateがない場合はcreatedAtをstartとして使用する', () => {
    const result = taskToGanttTask({ ...baseTask, startDate: null })
    expect(result.start).toEqual(new Date('2026-03-01'))
  })

  it('progressは0固定', () => {
    const result = taskToGanttTask(baseTask)
    expect(result.progress).toBe(0)
  })
})

describe('tasksToGanttTasks', () => {
  it('dueDateがないタスクを除外する', () => {
    const tasks: Task[] = [
      baseTask,
      { ...baseTask, id: 2, dueDate: null },
      { ...baseTask, id: 3, dueDate: '2026-04-01' },
    ]
    const result = tasksToGanttTasks(tasks, { includeMilestones: false })
    expect(result).toHaveLength(2)
    expect(result.map((t) => t.id)).toEqual(['task-1', 'task-3'])
  })

  it('includeMilestones=trueの場合はdueDateなしも含める', () => {
    const tasks: Task[] = [baseTask, { ...baseTask, id: 2, dueDate: null }]
    const result = tasksToGanttTasks(tasks, { includeMilestones: true })
    expect(result).toHaveLength(2)
  })

  it('dueDate順にソートする', () => {
    const tasks: Task[] = [
      { ...baseTask, id: 1, dueDate: '2026-04-10' },
      { ...baseTask, id: 2, dueDate: '2026-03-01' },
      { ...baseTask, id: 3, dueDate: '2026-04-01' },
    ]
    const result = tasksToGanttTasks(tasks)
    expect(result.map((t) => t.id)).toEqual(['task-2', 'task-3', 'task-1'])
  })
})
