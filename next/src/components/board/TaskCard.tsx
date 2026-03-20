import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import { Card, CardContent, Typography, Chip, Box, Avatar } from '@mui/material'
import type { Task } from '@/types'

const PRIORITY_CONFIG = {
  high: { label: '高', color: 'error', borderColor: '#ef4444' },
  medium: { label: '中', color: 'warning', borderColor: '#f59e0b' },
  low: { label: '低', color: 'success', borderColor: '#22c55e' },
} as const

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function isOverdue(dateStr: string): boolean {
  return new Date(dateStr) < new Date(new Date().toDateString())
}

function getInitials(name: string): string {
  return name.slice(0, 1).toUpperCase()
}

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

  const priority = PRIORITY_CONFIG[task.priority]
  const overdue = task.due_date ? isOverdue(task.due_date) : false

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick?.(task)}
      sx={{
        mb: 1,
        borderLeft: `3px solid ${priority.borderColor}`,
        '&:hover': { boxShadow: 3 },
      }}
    >
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Typography
          variant="body2"
          sx={{ mb: 1, fontWeight: 500, lineHeight: 1.4 }}
        >
          {task.title}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            <Chip
              label={priority.label}
              size="small"
              color={priority.color}
              sx={{ height: 18, fontSize: '0.65rem', fontWeight: 600 }}
            />
            {task.due_date && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.25,
                  color: overdue ? 'error.main' : 'text.secondary',
                }}
              >
                <CalendarTodayIcon sx={{ fontSize: 11 }} />
                <Typography
                  variant="caption"
                  sx={{ fontSize: '0.65rem', fontWeight: overdue ? 600 : 400 }}
                >
                  {formatDate(task.due_date)}
                </Typography>
              </Box>
            )}
          </Box>
          {task.assignee && (
            <Avatar
              sx={{
                width: 20,
                height: 20,
                fontSize: '0.6rem',
                bgcolor: 'primary.main',
              }}
              title={task.assignee.name}
            >
              {getInitials(task.assignee.name)}
            </Avatar>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}
