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
import { useState } from 'react'
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
    {
      onSuccess: (data) => {
        if (!selectedBoardId && data.boards.length > 0) {
          setSelectedBoardId(String(data.boards[0].id))
        }
      },
    },
  )
  const { data: tasksData, mutate } = useSWR<{ tasks: Task[] }>(
    selectedBoardId ? `/boards/${selectedBoardId}/tasks` : null,
    fetcher,
  )

  const project = projectData?.project
  const boards = boardsData?.boards ?? []
  const tasks = tasksData?.tasks ?? []
  const canEdit =
    project?.current_user_role === 'owner' ||
    project?.current_user_role === 'editor'

  const handleDateChange = async (taskId: number, dueDate: string) => {
    if (!canEdit) return
    try {
      await axiosInstance.patch(`/boards/${selectedBoardId}/tasks/${taskId}`, {
        due_date: dueDate,
      })
      mutate()
      setSnackbar({ msg: '期日を更新しました', severity: 'success' })
    } catch {
      setSnackbar({ msg: '期日の更新に失敗しました', severity: 'error' })
    }
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        component={Link}
        href={`/projects/${id}`}
        sx={{ mb: 2 }}
      >
        {project?.name ?? ''}
      </Button>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h5" component="h1">
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

      {!selectedBoardId ? (
        <Skeleton variant="rectangular" height={400} />
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
