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
} from '@mui/material'
import { useState } from 'react'
import type { MemberUser, Task } from '@/types'

interface Props {
  open: boolean
  onClose: () => void
  members: MemberUser[]
  onSave: (params: {
    title: string
    description: string | null
    priority: Task['priority']
    startDate: string | null
    dueDate: string | null
    assigneeId: number | null
  }) => Promise<void>
}

export default function TaskAddModal({
  open,
  onClose,
  members,
  onSave,
}: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Task['priority']>('medium')
  const [startDate, setStartDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [assigneeId, setAssigneeId] = useState<number | ''>('')
  const [saving, setSaving] = useState(false)

  const handleClose = () => {
    setTitle('')
    setDescription('')
    setPriority('medium')
    setStartDate('')
    setDueDate('')
    setAssigneeId('')
    onClose()
  }

  const handleSave = async () => {
    if (!title.trim()) return
    setSaving(true)
    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || null,
        priority,
        startDate: startDate || null,
        dueDate: dueDate || null,
        assigneeId: assigneeId === '' ? null : assigneeId,
      })
      handleClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>タスクを追加</DialogTitle>
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
          autoFocus
        />
        <TextField
          label="説明"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          multiline
          rows={3}
        />
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>優先度</InputLabel>
            <Select
              value={priority}
              label="優先度"
              onChange={(e) => setPriority(e.target.value as Task['priority'])}
            >
              <MenuItem value="low">低</MenuItem>
              <MenuItem value="medium">中</MenuItem>
              <MenuItem value="high">高</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="開始日"
            type="date"
            size="small"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="期日"
            type="date"
            size="small"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>担当者</InputLabel>
            <Select
              value={assigneeId}
              label="担当者"
              onChange={(e) => setAssigneeId(e.target.value as number | '')}
            >
              <MenuItem value="">なし</MenuItem>
              {members.map((m) => (
                <MenuItem key={m.id} value={m.id}>
                  {m.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>キャンセル</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving || !title.trim()}
        >
          {saving ? '追加中...' : '追加'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
