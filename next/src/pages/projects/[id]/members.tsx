import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import {
  Container,
  Typography,
  Button,
  Box,
  Skeleton,
  TextField,
  Snackbar,
} from '@mui/material'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import useSWR from 'swr'
import MemberList from '@/components/project/MemberList'
import { useAuth } from '@/hooks/useAuth'
import axiosInstance from '@/lib/axios'
import type { Project, ProjectMembership, Role } from '@/types'
import { fetcher } from '@/utils'

export default function ProjectMembersPage() {
  useAuth()
  const router = useRouter()
  const { id } = router.query
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [snackbar, setSnackbar] = useState<string | null>(null)

  const { data: projectData } = useSWR<{ project: Project }>(
    id ? `/projects/${id}` : null,
    fetcher,
  )
  const {
    data: membersData,
    isLoading,
    mutate,
  } = useSWR<{ memberships: ProjectMembership[] }>(
    id ? `/projects/${id}/memberships` : null,
    fetcher,
  )

  const project = projectData?.project
  const memberships = membersData?.memberships ?? []

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setInviteError(null)
    try {
      await axiosInstance.post(`/projects/${id}/memberships`, {
        email: inviteEmail,
        role: 'viewer',
      })
      setInviteEmail('')
      setSnackbar('メンバーを招待しました')
      mutate()
    } catch {
      setInviteError('招待に失敗しました。メールアドレスを確認してください。')
    }
  }

  const handleRoleChange = async (membershipId: number, role: Role) => {
    try {
      await axiosInstance.patch(`/projects/${id}/memberships/${membershipId}`, {
        role,
      })
      mutate()
    } catch {
      setSnackbar('ロールの変更に失敗しました')
    }
  }

  const handleDelete = async (membershipId: number) => {
    if (!window.confirm('このメンバーを削除しますか？')) return
    try {
      await axiosInstance.delete(`/projects/${id}/memberships/${membershipId}`)
      mutate()
    } catch {
      setSnackbar('削除に失敗しました')
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        component={Link}
        href={`/projects/${id}`}
        sx={{ mb: 2 }}
      >
        プロジェクトに戻る
      </Button>
      <Typography variant="h4" component="h1" gutterBottom>
        {project?.name ?? <Skeleton width={200} />} - メンバー管理
      </Typography>

      {project?.current_user_role === 'owner' && (
        <Box
          component="form"
          onSubmit={handleInvite}
          sx={{ display: 'flex', gap: 1, mb: 3 }}
        >
          <TextField
            size="small"
            label="メールアドレスで招待"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            error={!!inviteError}
            helperText={inviteError}
            sx={{ flex: 1 }}
          />
          <Button type="submit" variant="contained">
            招待
          </Button>
        </Box>
      )}

      {isLoading ? (
        <Skeleton variant="rectangular" height={200} />
      ) : (
        <MemberList
          members={memberships}
          currentUserRole={project?.current_user_role ?? 'viewer'}
          onRoleChange={handleRoleChange}
          onDelete={handleDelete}
        />
      )}

      <Snackbar
        open={!!snackbar}
        autoHideDuration={3000}
        onClose={() => setSnackbar(null)}
        message={snackbar}
      />
    </Container>
  )
}
