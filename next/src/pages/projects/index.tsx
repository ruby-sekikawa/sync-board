import AddIcon from '@mui/icons-material/Add'
import {
  Container,
  Typography,
  Button,
  Grid,
  Box,
  Skeleton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material'
import Link from 'next/link'
import { useState } from 'react'
import useSWR from 'swr'
import ProjectCard from '@/components/project/ProjectCard'
import { useAuth } from '@/hooks/useAuth'
import axiosInstance from '@/lib/axios'
import type { Project } from '@/types'
import { fetcher } from '@/utils'

export default function ProjectsPage() {
  useAuth()
  const { data, error, isLoading, mutate } = useSWR<{ projects: Project[] }>(
    '/projects',
    fetcher,
  )
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)

  const handleDelete = async () => {
    if (!deleteTarget) return
    await axiosInstance.delete(`/projects/${deleteTarget}`)
    setDeleteTarget(null)
    mutate()
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
        <Typography variant="h4" component="h1">
          プロジェクト
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          component={Link}
          href="/projects/new"
        >
          新規作成
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          プロジェクトの取得に失敗しました
        </Alert>
      )}

      <Grid container spacing={2}>
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Skeleton variant="rectangular" height={160} />
              </Grid>
            ))
          : data?.projects.map((project) => (
              <Grid item xs={12} sm={6} md={4} key={project.id}>
                <ProjectCard project={project} onDelete={setDeleteTarget} />
              </Grid>
            ))}
      </Grid>

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>プロジェクトを削除しますか？</DialogTitle>
        <DialogContent>
          <DialogContentText>この操作は取り消せません。</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>キャンセル</Button>
          <Button color="error" onClick={handleDelete}>
            削除
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
