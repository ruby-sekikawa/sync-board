import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, Typography, Chip, Box } from '@mui/material'
import type { Task } from '@/types'

const PRIORITY_COLOR = {
  high: 'error',
  medium: 'warning',
  low: 'success',
} as const

interface Props {
  task: Task
  onClick?: (task: Task) => void
}

export default function TaskCard({ task, onClick }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick?.(task)}
      sx={{ mb: 1, '&:hover': { boxShadow: 3 } }}
    >
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          {task.title}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            gap: 0.5,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <Chip
            label={task.priority}
            size="small"
            color={PRIORITY_COLOR[task.priority]}
          />
          {task.due_date && (
            <Typography variant="caption" color="text.secondary">
              {task.due_date}
            </Typography>
          )}
          {task.assignee && (
            <Typography variant="caption" color="text.secondary">
              {task.assignee.name}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}
