import AddIcon from '@mui/icons-material/Add'
import BarChartIcon from '@mui/icons-material/BarChart'
import PeopleIcon from '@mui/icons-material/People'
import {
  Container,
  Typography,
  Button,
  Grid,
  Box,
  Skeleton,
  Alert,
} from '@mui/material'
import Link from 'next/link'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import { useAuth } from '@/hooks/useAuth'
import axiosInstance from '@/lib/axios'
import type { Board, Project } from '@/types'
import { fetcher } from '@/utils'

export default function ProjectDetailPage() {
  useAuth()
  const router = useRouter()
  const { id } = router.query

  const { data: projectData, error: projectError } = useSWR<{
    project: Project
  }>(id ? `/projects/${id}` : null, fetcher)
  const {
    data: boardsData,
    isLoading,
    mutate,
  } = useSWR<{ boards: Board[] }>(id ? `/projects/${id}/boards` : null, fetcher)

  const project = projectData?.project
  const boards = boardsData?.boards ?? []
  const canEdit =
    project?.current_user_role === 'owner' ||
    project?.current_user_role === 'editor'

  const handleCreateBoard = async () => {
    const name = window.prompt('ボード名を入力してください')
    if (!name?.trim()) return
    await axiosInstance.post(`/projects/${id}/boards`, { name })
    mutate()
  }

  if (projectError) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">プロジェクトが見つかりません</Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" component="h1">
            {project?.name ?? <Skeleton width={200} />}
          </Typography>
          {project?.description && (
            <Typography variant="body1" color="text.secondary">
              {project.description}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<BarChartIcon />}
            component={Link}
            href={`/projects/${id}/gantt`}
          >
            ガントチャート
          </Button>
          <Button
            variant="outlined"
            startIcon={<PeopleIcon />}
            component={Link}
            href={`/projects/${id}/members`}
          >
            メンバー管理
          </Button>
          {canEdit && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateBoard}
            >
              ボード追加
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={2}>
        {isLoading
          ? Array.from({ length: 2 }).map((_, i) => (
              <Grid item xs={12} sm={6} key={i}>
                <Skeleton variant="rectangular" height={100} />
              </Grid>
            ))
          : boards.map((board) => (
              <Grid item xs={12} sm={6} md={4} key={board.id}>
                <Box
                  component={Link}
                  href={`/projects/${id}/boards/${board.id}`}
                  sx={{
                    display: 'block',
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    textDecoration: 'none',
                    color: 'inherit',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <Typography variant="h6">{board.name}</Typography>
                  {board.description && (
                    <Typography variant="body2" color="text.secondary">
                      {board.description}
                    </Typography>
                  )}
                </Box>
              </Grid>
            ))}
      </Grid>
    </Container>
  )
}
