import { render, screen } from '@testing-library/react'
import BoardColumn from '@/components/board/Column'
import type { Column, Task } from '@/types'

jest.mock('@dnd-kit/core', () => ({
  useDroppable: () => ({ setNodeRef: jest.fn() }),
}))

jest.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  verticalListSortingStrategy: {},
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}))

jest.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: () => '' } },
}))

const mockTasks: Task[] = [
  {
    id: 1,
    column_id: 1,
    board_id: 1,
    title: 'タスク1',
    description: null,
    assignee_id: null,
    assignee: null,
    due_date: null,
    priority: 'medium',
    position: 65536,
    start_date: '2026-03-15',
    created_by_user_id: 1,
    created_at: '2026-03-15T00:00:00.000Z',
    updated_at: '2026-03-15T00:00:00.000Z',
  },
  {
    id: 2,
    column_id: 1,
    board_id: 1,
    title: 'タスク2',
    description: null,
    assignee_id: null,
    assignee: null,
    due_date: null,
    priority: 'low',
    position: 131072,
    start_date: '2026-03-15',
    created_by_user_id: 1,
    created_at: '2026-03-15T00:00:00.000Z',
    updated_at: '2026-03-15T00:00:00.000Z',
  },
]

const mockColumn: Column = {
  id: 1,
  board_id: 1,
  name: 'TODO',
  position: 65536,
  tasks: mockTasks,
  created_at: '2026-03-15T00:00:00.000Z',
  updated_at: '2026-03-15T00:00:00.000Z',
}

describe('BoardColumn', () => {
  it('カラム名を表示する', () => {
    render(<BoardColumn column={mockColumn} />)
    expect(screen.getByText('TODO')).toBeInTheDocument()
  })

  it('タスク一覧を表示する', () => {
    render(<BoardColumn column={mockColumn} />)
    expect(screen.getByText('タスク1')).toBeInTheDocument()
    expect(screen.getByText('タスク2')).toBeInTheDocument()
  })

  it('タスクが0件の場合も正常にレンダリングされる', () => {
    render(<BoardColumn column={{ ...mockColumn, tasks: [] }} />)
    expect(screen.getByText('TODO')).toBeInTheDocument()
  })
})
