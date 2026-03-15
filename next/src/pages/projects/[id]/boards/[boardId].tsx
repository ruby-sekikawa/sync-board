import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { Box, Typography, Button, Skeleton } from '@mui/material'
import Link from 'next/link'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import KanbanBoard from '@/components/board/KanbanBoard'
import { useAuth } from '@/hooks/useAuth'
import type { Board, Project } from '@/types'
import { fetcher } from '@/utils'

export default function BoardPage() {
  useAuth()
  const router = useRouter()
  const { id, boardId } = router.query

  const { data: boardData } = useSWR<{ board: Board }>(
    boardId ? `/projects/${id}/boards/${boardId}` : null,
    fetcher,
  )
  const { data: projectData } = useSWR<{ project: Project }>(
    id ? `/projects/${id}` : null,
    fetcher,
  )

  const project = projectData?.project
  const board = boardData?.board
  const canEdit =
    project?.current_user_role === 'owner' ||
    project?.current_user_role === 'editor'

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Button
          size="small"
          startIcon={<ArrowBackIcon />}
          component={Link}
          href={`/projects/${id}`}
        >
          {project?.name ?? ''}
        </Button>
        <Typography variant="h6">
          {board?.name ?? <Skeleton width={120} />}
        </Typography>
      </Box>

      {typeof boardId === 'string' && typeof id === 'string' && (
        <KanbanBoard boardId={boardId} projectId={id} canEdit={!!canEdit} />
      )}
    </Box>
  )
}
