import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
} from '@mui/material'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import axiosInstance from '@/lib/axios'

export default function NewProjectPage() {
  useAuth()
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('プロジェクト名は必須です')
      return
    }
    if (name.length > 100) {
      setError('プロジェクト名は100文字以内で入力してください')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const res = await axiosInstance.post<{ project: { id: number } }>(
        '/projects',
        {
          name,
          description,
        },
      )
      router.push(`/projects/${res.data.project.id}`)
    } catch {
      setError('プロジェクトの作成に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        新規プロジェクト作成
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        <TextField
          label="プロジェクト名"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          inputProps={{ maxLength: 100 }}
        />
        <TextField
          label="説明（任意）"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          rows={3}
        />
        <Button type="submit" variant="contained" disabled={submitting}>
          {submitting ? '作成中...' : '作成'}
        </Button>
      </Box>
    </Container>
  )
}
