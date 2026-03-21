import { render, screen } from '@testing-library/react'
import TaskCard from '@/components/board/TaskCard'
import type { Task } from '@/types'

const mockUseSortable = {
  attributes: {},
  listeners: {},
  setNodeRef: jest.fn(),
  transform: null,
  transition: null,
  isDragging: false,
}

jest.mock('@dnd-kit/sortable', () => ({
  useSortable: () => mockUseSortable,
}))

jest.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: () => '' } },
}))

const mockTask: Task = {
  id: 1,
  column_id: 1,
  board_id: 1,
  title: 'テストタスク',
  description: 'タスクの説明',
  assignee_id: null,
  assignee: null,
  due_date: '2026-03-31',
  priority: 'high',
  position: 65536,
  start_date: '2026-03-15',
  created_by_user_id: 1,
  created_at: '2026-03-15T00:00:00.000Z',
  updated_at: '2026-03-15T00:00:00.000Z',
}

describe('TaskCard', () => {
  beforeEach(() => {
    mockUseSortable.isDragging = false
  })

  it('タスクタイトルを表示する', () => {
    render(<TaskCard task={mockTask} />)
    expect(screen.getByText('テストタスク')).toBeInTheDocument()
  })

  it('priorityを表示する', () => {
    render(<TaskCard task={mockTask} />)
    expect(screen.getByText('高')).toBeInTheDocument()
  })

  it('due_dateを表示する', () => {
    render(<TaskCard task={mockTask} />)
    expect(screen.getByText('3/31')).toBeInTheDocument()
  })

  it('isDragging の場合は opacity が下がる', () => {
    mockUseSortable.isDragging = true
    const { container } = render(<TaskCard task={mockTask} />)
    const card = container.firstChild as HTMLElement
    expect(card.style.opacity).toBe('0.4')
  })
})
