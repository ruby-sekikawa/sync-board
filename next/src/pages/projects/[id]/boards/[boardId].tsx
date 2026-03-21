import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { Box, Typography, Button, Skeleton, TextField } from '@mui/material'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import useSWR from 'swr'
import KanbanBoard from '@/components/board/KanbanBoard'
import { useAuth } from '@/hooks/useAuth'
import axiosInstance from '@/lib/axios'
import type { Board, Project } from '@/types'
import { fetcher } from '@/utils'

export default function BoardPage() {
  useAuth()
  const router = useRouter()
  const { id, boardId } = router.query

  const { data: boardData, mutate: mutateBoard } = useSWR<{ board: Board }>(
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
    project?.currentUserRole === 'owner' ||
    project?.currentUserRole === 'editor'

  const [editingName, setEditingName] = useState(false)
  const [boardName, setBoardName] = useState('')

  useEffect(() => {
    if (board?.name) setBoardName(board.name)
  }, [board?.name])

  const handleNameSubmit = async () => {
    const name = boardName.trim()
    if (!name || name === board?.name) {
      setBoardName(board?.name ?? '')
      setEditingName(false)
      return
    }
    await axiosInstance.patch(`/projects/${id}/boards/${boardId}`, { name })
    mutateBoard()
    setEditingName(false)
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          px: 2,
          pt: 1,
          pb: 0.5,
        }}
      >
        <Button
          size="small"
          startIcon={<ArrowBackIcon />}
          component={Link}
          href={`/projects/${id}`}
          sx={{
            alignSelf: 'flex-start',
            color: 'text.secondary',
            px: 0,
            minWidth: 0,
            '&:hover': { bgcolor: 'transparent', color: 'text.primary' },
          }}
        >
          {project?.name ?? <Skeleton width={80} />}
        </Button>
        <Box sx={{ mt: 0.5 }}>
          {editingName ? (
            <TextField
              size="small"
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              onBlur={handleNameSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNameSubmit()
                if (e.key === 'Escape') {
                  setBoardName(board?.name ?? '')
                  setEditingName(false)
                }
              }}
              autoFocus
              sx={{ width: 280 }}
              inputProps={{ style: { fontWeight: 700, fontSize: '1.1rem' } }}
            />
          ) : board ? (
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{
                cursor: canEdit ? 'pointer' : 'default',
                display: 'inline-block',
                '&:hover': canEdit
                  ? {
                      bgcolor: 'action.hover',
                      borderRadius: 1,
                      px: 0.5,
                      mx: -0.5,
                    }
                  : {},
              }}
              onClick={(e) => {
                e.stopPropagation()
                if (canEdit) setEditingName(true)
              }}
            >
              {board.name}
            </Typography>
          ) : (
            <Skeleton width={160} height={36} />
          )}
        </Box>
      </Box>

      {typeof boardId === 'string' && typeof id === 'string' && (
        <KanbanBoard boardId={boardId} projectId={id} canEdit={!!canEdit} />
      )}
    </Box>
  )
}
