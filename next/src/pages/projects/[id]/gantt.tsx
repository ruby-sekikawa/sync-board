import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import {
  Container,
  Typography,
  Button,
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Skeleton,
  Snackbar,
  Alert,
} from '@mui/material'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import useSWR from 'swr'
import GanttChart from '@/components/gantt/GanttChart'
import { useAuth } from '@/hooks/useAuth'
import axiosInstance from '@/lib/axios'
import type { Board, Project, Task } from '@/types'
import { fetcher } from '@/utils'

export default function GanttPage() {
  useAuth()
  const router = useRouter()
  const { id } = router.query
  const [selectedBoardId, setSelectedBoardId] = useState<string>('')
  const [snackbar, setSnackbar] = useState<{
    msg: string
    severity: 'success' | 'error'
  } | null>(null)

  const { data: projectData } = useSWR<{ project: Project }>(
    id ? `/projects/${id}` : null,
    fetcher,
  )
  const { data: boardsData } = useSWR<{ boards: Board[] }>(
    id ? `/projects/${id}/boards` : null,
    fetcher,
  )

  useEffect(() => {
    if (!selectedBoardId && boardsData?.boards.length) {
      setSelectedBoardId(String(boardsData.boards[0].id))
    }
  }, [boardsData, selectedBoardId])
  const { data: tasksData, mutate } = useSWR<{ tasks: Task[] }>(
    selectedBoardId ? `/boards/${selectedBoardId}/tasks` : null,
    fetcher,
  )

  const project = projectData?.project
  const boards = boardsData?.boards ?? []
  const tasks = tasksData?.tasks ?? []
  const canEdit =
    project?.currentUserRole === 'owner' ||
    project?.currentUserRole === 'editor'

  const handleDateChange = async (
    taskId: number,
    startDate: string,
    dueDate: string,
  ) => {
    if (!canEdit) return
    try {
      await axiosInstance.patch(`/boards/${selectedBoardId}/tasks/${taskId}`, {
        startDate,
        dueDate,
      })
      mutate()
      setSnackbar({ msg: '日付を更新しました', severity: 'success' })
    } catch {
      setSnackbar({ msg: '日付の更新に失敗しました', severity: 'error' })
    }
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          size="small"
          startIcon={<ArrowBackIcon />}
          component={Link}
          href={`/projects/${id}`}
          sx={{
            color: 'text.secondary',
            px: 0,
            minWidth: 0,
            mb: 0.5,
            '&:hover': { bgcolor: 'transparent', color: 'text.primary' },
          }}
        >
          {project?.name ?? <Skeleton width={80} />}
        </Button>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h5" component="h1" fontWeight="bold">
            ガントチャート
          </Typography>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>ボード</InputLabel>
            <Select
              value={selectedBoardId}
              label="ボード"
              onChange={(e) => setSelectedBoardId(e.target.value)}
            >
              {boards.map((board) => (
                <MenuItem key={board.id} value={String(board.id)}>
                  {board.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {!selectedBoardId ? (
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 1 }} />
      ) : (
        <GanttChart
          tasks={tasks}
          onDateChange={canEdit ? handleDateChange : undefined}
        />
      )}

      <Snackbar
        open={!!snackbar}
        autoHideDuration={3000}
        onClose={() => setSnackbar(null)}
      >
        <Alert severity={snackbar?.severity} onClose={() => setSnackbar(null)}>
          {snackbar?.msg}
        </Alert>
      </Snackbar>
    </Container>
  )
}
