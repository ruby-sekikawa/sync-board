import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
  IconButton,
} from '@mui/material'
import { useState } from 'react'
import type { Task } from '@/types'

interface Props {
  task: Task | null
  canEdit: boolean
  onClose: () => void
  onSave: (
    taskId: number,
    params: Partial<
      Pick<Task, 'title' | 'description' | 'priority' | 'due_date'>
    >,
  ) => Promise<void>
  onDelete: (taskId: number) => Promise<void>
}

export default function TaskEditModal({
  task,
  canEdit,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [priority, setPriority] = useState<Task['priority']>(
    task?.priority ?? 'medium',
  )
  const [dueDate, setDueDate] = useState(task?.due_date ?? '')
  const [saving, setSaving] = useState(false)

  if (!task) return null

  const handleSave = async () => {
    if (!title.trim()) return
    setSaving(true)
    try {
      await onSave(task.id, {
        title: title.trim(),
        description: description.trim() || null,
        priority,
        due_date: dueDate || null,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    await onDelete(task.id)
    onClose()
  }

  return (
    <Dialog open={!!task} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        タスク詳細
        {canEdit && (
          <IconButton size="small" color="error" onClick={handleDelete}>
            <DeleteOutlineIcon />
          </IconButton>
        )}
      </DialogTitle>
      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          pt: '16px !important',
          overflow: 'visible',
        }}
      >
        <TextField
          label="タイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          required
          disabled={!canEdit}
        />
        <TextField
          label="説明"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          multiline
          rows={3}
          disabled={!canEdit}
        />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>優先度</InputLabel>
            <Select
              value={priority}
              label="優先度"
              onChange={(e) => setPriority(e.target.value as Task['priority'])}
              disabled={!canEdit}
            >
              <MenuItem value="low">低</MenuItem>
              <MenuItem value="medium">中</MenuItem>
              <MenuItem value="high">高</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="期日"
            type="date"
            size="small"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            disabled={!canEdit}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>閉じる</Button>
        {canEdit && (
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? '保存中...' : '保存'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}
