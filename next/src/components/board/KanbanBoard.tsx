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
import AddIcon from '@mui/icons-material/Add'
import {
  Box,
  Snackbar,
  Alert,
  Button,
  TextField,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material'
import { useState, useCallback } from 'react'
import useSWR from 'swr'
import BoardColumn from './Column'
import TaskAddModal from './TaskAddModal'
import TaskCard from './TaskCard'
import TaskEditModal from './TaskEditModal'
import ConnectionBanner from '@/components/common/ConnectionBanner'
import { useBoard } from '@/hooks/useBoard'
import { useBoardChannel } from '@/hooks/useBoardChannel'
import type { Column, MemberUser, ProjectMembership, Task } from '@/types'
import { fetcher } from '@/utils'

interface Props {
  boardId: string
  projectId: string
  canEdit: boolean
}

export default function KanbanBoard({ boardId, projectId, canEdit }: Props) {
  const {
    board,
    isLoading,
    moveTask,
    addTask,
    addColumn,
    updateColumn,
    updateTask,
    deleteTask,
    deleteColumn,
  } = useBoard(boardId, projectId)
  const { connectionStatus } = useBoardChannel(boardId, projectId)
  const { data: membershipsData } = useSWR<{
    memberships: ProjectMembership[]
  }>(`/projects/${projectId}/memberships`, fetcher)
  const members: MemberUser[] =
    membershipsData?.memberships.map((m) => m.user) ?? []
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [overColumnId, setOverColumnId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [addingColumn, setAddingColumn] = useState(false)
  const [newColumnName, setNewColumnName] = useState('')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [addTaskColumnId, setAddTaskColumnId] = useState<number | null>(null)
  const [deleteTargetColumnId, setDeleteTargetColumnId] = useState<
    number | null
  >(null)

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
    if (!overId) return
    const overIdStr = String(overId)
    if (overIdStr.startsWith('col-')) {
      setOverColumnId(Number(overIdStr.slice(4)))
    } else {
      setOverColumnId(Number(overId))
    }
  }, [])

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveTask(null)
      setOverColumnId(null)
      const { active, over, delta } = event
      if (!over || !board) return

      const taskId = Number(active.id)
      const overIdStr = String(over.id)
      const isDraggingDown = delta.y > 0

      // over.id がカラムID（'col-N'）かタスクIDかを判定
      const allTasks = board.columns.flatMap((c) => c.tasks)
      let toColumnId: number | undefined
      let overTask: (typeof allTasks)[number] | undefined
      if (overIdStr.startsWith('col-')) {
        toColumnId = board.columns.find((c) => c.id === Number(overIdStr.slice(4)))?.id
      } else {
        const overId = Number(over.id)
        overTask = allTasks.find((t) => t.id === overId)
        toColumnId = overTask ? overTask.columnId : undefined
      }

      if (!toColumnId) return

      const toColumn = board.columns.find((c) => c.id === toColumnId)
      if (!toColumn) return

      const toTasks = toColumn.tasks.filter((t) => t.id !== taskId)
      let toPosition: number

      if (overTask && overTask.id !== taskId) {
        const overIndex = toTasks.findIndex((t) => t.id === overTask!.id)
        if (isDraggingDown) {
          // 下方向: overTask の後ろに挿入
          const prev = toTasks[overIndex]?.position ?? overTask.position
          const next = toTasks[overIndex + 1]?.position ?? prev * 2
          toPosition = (prev + next) / 2
        } else {
          // 上方向: overTask の前に挿入
          const prev = toTasks[overIndex - 1]?.position ?? 0
          const next = toTasks[overIndex]?.position ?? overTask.position * 2
          toPosition = (prev + next) / 2
        }
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

  const handleAddColumn = async () => {
    const name = newColumnName.trim()
    if (!name) return
    try {
      await addColumn(name)
      setNewColumnName('')
      setAddingColumn(false)
    } catch {
      setError('カラムの作成に失敗しました')
    }
  }

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
              canEdit={canEdit}
              onOpenAddTask={canEdit ? setAddTaskColumnId : undefined}
              onTaskClick={setSelectedTask}
              onUpdateColumn={canEdit ? updateColumn : undefined}
              onDeleteColumn={canEdit ? setDeleteTargetColumnId : undefined}
            />
          ))}
          {canEdit && (
            <Box sx={{ flexShrink: 0, width: 280 }}>
              {addingColumn ? (
                <Paper
                  sx={{
                    p: 1.5,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                  }}
                >
                  <TextField
                    size="small"
                    placeholder="カラム名"
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setAddingColumn(false)
                    }}
                    autoFocus
                    fullWidth
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={handleAddColumn}
                    >
                      追加
                    </Button>
                    <Button size="small" onClick={() => setAddingColumn(false)}>
                      キャンセル
                    </Button>
                  </Box>
                </Paper>
              ) : (
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => setAddingColumn(true)}
                  sx={{
                    width: '100%',
                    justifyContent: 'flex-start',
                    color: 'text.secondary',
                  }}
                >
                  カラムを追加
                </Button>
              )}
            </Box>
          )}
        </Box>
        <DragOverlay>
          {activeTask && <TaskCard task={activeTask} />}
        </DragOverlay>
      </DndContext>

      <TaskAddModal
        open={addTaskColumnId !== null}
        onClose={() => setAddTaskColumnId(null)}
        members={members}
        onSave={async (params) => {
          if (addTaskColumnId === null) return
          await addTask(
            addTaskColumnId,
            params.title,
            params.priority,
            params.description,
            params.dueDate,
            params.assigneeId,
            params.startDate,
          )
          setAddTaskColumnId(null)
        }}
      />

      <TaskEditModal
        key={selectedTask?.id}
        task={selectedTask}
        canEdit={canEdit}
        members={members}
        onClose={() => setSelectedTask(null)}
        onSave={async (taskId, params) => {
          await updateTask(taskId, params)
        }}
        onDelete={async (taskId) => {
          await deleteTask(taskId)
        }}
      />

      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Dialog
        open={deleteTargetColumnId !== null}
        onClose={() => setDeleteTargetColumnId(null)}
      >
        <DialogTitle>カラムを削除しますか？</DialogTitle>
        <DialogContent>
          <DialogContentText>
            このカラムに含まれるタスクもすべて削除されます。この操作は元に戻せません。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTargetColumnId(null)}>
            キャンセル
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={async () => {
              if (deleteTargetColumnId === null) return
              try {
                await deleteColumn(deleteTargetColumnId)
              } catch {
                setError('カラムの削除に失敗しました')
              } finally {
                setDeleteTargetColumnId(null)
              }
            }}
          >
            削除
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
