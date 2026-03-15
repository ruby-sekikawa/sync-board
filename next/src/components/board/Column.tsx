import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import AddIcon from '@mui/icons-material/Add'
import { Box, Typography, TextField, Button } from '@mui/material'
import { useState } from 'react'
import TaskCard from './TaskCard'
import type { Column, Task } from '@/types'

interface Props {
  column: Column
  isOver?: boolean
  onAddTask?: (columnId: number, title: string) => void
  onTaskClick?: (task: Task) => void
}

export default function BoardColumn({
  column,
  isOver,
  onAddTask,
  onTaskClick,
}: Props) {
  const [adding, setAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const { setNodeRef } = useDroppable({ id: column.id })

  const handleAdd = () => {
    if (!newTitle.trim()) return
    onAddTask?.(column.id, newTitle.trim())
    setNewTitle('')
    setAdding(false)
  }

  return (
    <Box
      ref={setNodeRef}
      sx={{
        width: 280,
        minHeight: 200,
        bgcolor: isOver ? 'action.hover' : 'grey.100',
        borderRadius: 1,
        p: 1,
        flexShrink: 0,
        border: '2px solid',
        borderColor: isOver ? 'primary.main' : 'transparent',
        transition: 'border-color 0.15s, background-color 0.15s',
      }}
    >
      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, px: 0.5 }}>
        {column.name}
        <Typography
          component="span"
          variant="caption"
          color="text.secondary"
          sx={{ ml: 1 }}
        >
          {column.tasks.length}
        </Typography>
      </Typography>

      <SortableContext
        items={column.tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        {column.tasks.map((task) => (
          <TaskCard key={task.id} task={task} onClick={onTaskClick} />
        ))}
      </SortableContext>

      {adding ? (
        <Box sx={{ mt: 1 }}>
          <TextField
            autoFocus
            size="small"
            fullWidth
            placeholder="タスク名を入力"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd()
              if (e.key === 'Escape') setAdding(false)
            }}
            sx={{ mb: 0.5 }}
          />
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Button size="small" variant="contained" onClick={handleAdd}>
              追加
            </Button>
            <Button size="small" onClick={() => setAdding(false)}>
              キャンセル
            </Button>
          </Box>
        </Box>
      ) : (
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={() => setAdding(true)}
          sx={{ mt: 0.5, width: '100%', justifyContent: 'flex-start' }}
        >
          タスクを追加
        </Button>
      )}
    </Box>
  )
}
