import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { Box, Typography, TextField, Button, IconButton } from '@mui/material'
import { useState } from 'react'

import TaskCard from './TaskCard'
import type { Column, Task } from '@/types'

interface Props {
  column: Column
  isOver?: boolean
  canEdit?: boolean
  onOpenAddTask?: (columnId: number) => void
  onTaskClick?: (task: Task) => void
  onUpdateColumn?: (columnId: number, name: string) => void
  onDeleteColumn?: (columnId: number) => void
}

export default function BoardColumn({
  column,
  isOver,
  canEdit,
  onOpenAddTask,
  onTaskClick,
  onUpdateColumn,
  onDeleteColumn,
}: Props) {
  const [editingName, setEditingName] = useState(false)
  const [columnName, setColumnName] = useState(column.name)
  const { setNodeRef } = useDroppable({ id: `col-${column.id}` })

  const handleNameSubmit = () => {
    const name = columnName.trim()
    if (!name || name === column.name) {
      setColumnName(column.name)
      setEditingName(false)
      return
    }
    onUpdateColumn?.(column.id, name)
    setEditingName(false)
  }

  return (
    <Box
      ref={setNodeRef}
      sx={{
        width: 280,
        height: 500,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: isOver ? 'action.hover' : 'grey.100',
        borderRadius: 1,
        p: 1,
        flexShrink: 0,
        border: '2px solid',
        borderColor: isOver ? 'primary.main' : 'transparent',
        transition: 'border-color 0.15s, background-color 0.15s',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 1.5,
          px: 0.5,
          gap: 1,
        }}
      >
        {editingName ? (
          <TextField
            size="small"
            value={columnName}
            onChange={(e) => setColumnName(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleNameSubmit()
              if (e.key === 'Escape') {
                setColumnName(column.name)
                setEditingName(false)
              }
            }}
            autoFocus
            fullWidth
          />
        ) : (
          <>
            <Typography
              variant="subtitle2"
              fontWeight="bold"
              sx={{
                flexGrow: 1,
                cursor: canEdit ? 'pointer' : 'default',
                letterSpacing: 0.3,
                '&:hover': canEdit ? { opacity: 0.7 } : {},
              }}
              onClick={() => canEdit && setEditingName(true)}
            >
              {column.name}
            </Typography>
            <Box
              sx={{
                bgcolor: 'grey.300',
                color: 'text.secondary',
                borderRadius: '10px',
                px: 1,
                py: 0.25,
                fontSize: '0.7rem',
                fontWeight: 700,
                lineHeight: 1.4,
                minWidth: 20,
                textAlign: 'center',
              }}
            >
              {column.tasks.length}
            </Box>
          </>
        )}
        {canEdit && !editingName && (
          <IconButton
            size="small"
            onClick={() => onDeleteColumn?.(column.id)}
            sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <Box sx={{ flexGrow: 1, overflowY: 'auto', minHeight: 0 }}>
        <SortableContext
          items={column.tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={onTaskClick} />
          ))}
        </SortableContext>
      </Box>

      {onOpenAddTask && (
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={() => onOpenAddTask(column.id)}
          sx={{ mt: 0.5, width: '100%', justifyContent: 'flex-start' }}
        >
          タスクを追加
        </Button>
      )}
    </Box>
  )
}
