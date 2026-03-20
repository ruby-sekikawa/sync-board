import AddIcon from '@mui/icons-material/Add'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import BarChartIcon from '@mui/icons-material/BarChart'
import PeopleIcon from '@mui/icons-material/People'
import ViewKanbanOutlinedIcon from '@mui/icons-material/ViewKanbanOutlined'
import {
  Container,
  Typography,
  Button,
  Grid,
  Box,
  Skeleton,
  Alert,
  Card,
  CardActionArea,
  CardContent,
  Chip,
} from '@mui/material'
import Link from 'next/link'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import { useAuth } from '@/hooks/useAuth'
import axiosInstance from '@/lib/axios'
import type { Board, Project } from '@/types'
import { fetcher } from '@/utils'

const ROLE_LABEL: Record<string, string> = {
  owner: 'オーナー',
  editor: '編集者',
  viewer: '閲覧者',
}

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
      {/* ヘッダー */}
      <Box sx={{ mb: 4 }}>
        <Button
          size="small"
          startIcon={<ArrowBackIcon />}
          component={Link}
          href="/projects"
          sx={{
            color: 'text.secondary',
            px: 0,
            minWidth: 0,
            mb: 1,
            '&:hover': { bgcolor: 'transparent', color: 'text.primary' },
          }}
        >
          プロジェクト一覧
        </Button>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h5" component="h1" fontWeight="bold">
              {project?.name ?? <Skeleton width={200} />}
            </Typography>
            {project?.current_user_role && (
              <Chip
                label={ROLE_LABEL[project.current_user_role]}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem' }}
              />
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<BarChartIcon />}
              component={Link}
              href={`/projects/${id}/gantt`}
            >
              ガントチャート
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<PeopleIcon />}
              component={Link}
              href={`/projects/${id}/members`}
            >
              メンバー管理
            </Button>
            {canEdit && (
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleCreateBoard}
              >
                ボード追加
              </Button>
            )}
          </Box>
        </Box>
        {project?.description && (
          <Typography variant="body2" color="text.secondary">
            {project.description}
          </Typography>
        )}
      </Box>

      {/* ボード一覧 */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography
          variant="subtitle2"
          color="text.secondary"
          fontWeight="bold"
        >
          ボード
        </Typography>
        {!isLoading && (
          <Box
            sx={{
              bgcolor: 'grey.200',
              color: 'text.secondary',
              borderRadius: '10px',
              px: 1,
              py: 0.1,
              fontSize: '0.7rem',
              fontWeight: 700,
            }}
          >
            {boards.length}
          </Box>
        )}
      </Box>

      <Grid container spacing={2}>
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton
                variant="rectangular"
                height={110}
                sx={{ borderRadius: 2 }}
              />
            </Grid>
          ))
        ) : boards.length === 0 ? (
          <Grid item xs={12}>
            <Box
              sx={{
                textAlign: 'center',
                py: 8,
                color: 'text.disabled',
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 2,
              }}
            >
              <ViewKanbanOutlinedIcon
                sx={{ fontSize: 40, mb: 1, opacity: 0.4 }}
              />
              <Typography variant="body2">ボードがありません</Typography>
              {canEdit && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleCreateBoard}
                  sx={{ mt: 2 }}
                >
                  最初のボードを作成
                </Button>
              )}
            </Box>
          </Grid>
        ) : (
          boards.map((board) => (
            <Grid item xs={12} sm={6} md={4} key={board.id}>
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  transition: 'box-shadow 0.15s, border-color 0.15s',
                  '&:hover': {
                    boxShadow: 3,
                    borderColor: 'primary.main',
                  },
                }}
              >
                <CardActionArea
                  component={Link}
                  href={`/projects/${id}/boards/${board.id}`}
                  sx={{ p: 0 }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1.5,
                      }}
                    >
                      <Box
                        sx={{
                          bgcolor: 'primary.50',
                          color: 'primary.main',
                          borderRadius: 1.5,
                          p: 0.75,
                          display: 'flex',
                          flexShrink: 0,
                        }}
                      >
                        <ViewKanbanOutlinedIcon sx={{ fontSize: 20 }} />
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="subtitle2"
                          fontWeight="bold"
                          sx={{ lineHeight: 1.3 }}
                        >
                          {board.name}
                        </Typography>
                        {board.description && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {board.description}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Container>
  )
}
