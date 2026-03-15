import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { Box, Snackbar, Alert } from '@mui/material'
import { useState, useCallback } from 'react'
import BoardColumn from './Column'
import TaskCard from './TaskCard'
import ConnectionBanner from '@/components/common/ConnectionBanner'
import { useBoard } from '@/hooks/useBoard'
import { useBoardChannel } from '@/hooks/useBoardChannel'
import type { Column, Task } from '@/types'

interface Props {
  boardId: string
  canEdit: boolean
}

export default function KanbanBoard({ boardId, canEdit }: Props) {
  const { board, isLoading, moveTask, addTask } = useBoard(boardId)
  const { connectionStatus } = useBoardChannel(boardId)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [overColumnId, setOverColumnId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const task = board?.columns
        .flatMap((c) => c.tasks)
        .find((t) => t.id === event.active.id)
      setActiveTask(task ?? null)
    },
    [board],
  )

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const overId = event.over?.id
    if (overId) setOverColumnId(Number(overId))
  }, [])

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveTask(null)
      setOverColumnId(null)
      const { active, over } = event
      if (!over || !board) return

      const taskId = Number(active.id)
      const overId = Number(over.id)

      // over.id がタスクIDかカラムIDかを判定
      const allTasks = board.columns.flatMap((c) => c.tasks)
      const overTask = allTasks.find((t) => t.id === overId)
      const toColumnId = overTask
        ? overTask.column_id
        : board.columns.find((c) => c.id === overId)?.id

      if (!toColumnId) return

      const toColumn = board.columns.find((c) => c.id === toColumnId)
      if (!toColumn) return

      const toTasks = toColumn.tasks.filter((t) => t.id !== taskId)
      let toPosition: number

      if (overTask && overTask.id !== taskId) {
        const overIndex = toTasks.findIndex((t) => t.id === overTask.id)
        const prev = toTasks[overIndex - 1]?.position ?? 0
        const next = toTasks[overIndex]?.position ?? overTask.position * 2
        toPosition = (prev + next) / 2
      } else {
        const maxPos = toTasks.reduce((max, t) => Math.max(max, t.position), 0)
        toPosition = maxPos + 65536
      }

      try {
        await moveTask({ taskId, toColumnId, toPosition })
      } catch {
        setError('タスクの移動に失敗しました。元の位置に戻ります。')
      }
    },
    [board, moveTask],
  )

  const handleAddTask = useCallback(
    async (columnId: number, title: string) => {
      try {
        await addTask(columnId, title)
      } catch {
        setError('タスクの作成に失敗しました')
      }
    },
    [addTask],
  )

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', gap: 2, p: 2 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Box
            key={i}
            sx={{
              width: 280,
              height: 400,
              bgcolor: 'grey.100',
              borderRadius: 1,
            }}
          />
        ))}
      </Box>
    )
  }

  if (!board) return null

  return (
    <>
      <ConnectionBanner status={connectionStatus} />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            p: 2,
            overflowX: 'auto',
            minHeight: '80vh',
          }}
        >
          {board.columns.map((column: Column) => (
            <BoardColumn
              key={column.id}
              column={column}
              isOver={overColumnId === column.id}
              onAddTask={canEdit ? handleAddTask : undefined}
            />
          ))}
        </Box>
        <DragOverlay>
          {activeTask && <TaskCard task={activeTask} />}
        </DragOverlay>
      </DndContext>

      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </>
  )
}
