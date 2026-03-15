import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Link as MuiLink,
} from '@mui/material'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import axiosInstance from '@/lib/axios'

export default function SignUp() {
  const router = useRouter()
  const { isAuthenticated, isLoading, mutate } = useAuth({ requireAuth: false })
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!isLoading && isAuthenticated) {
    router.replace('/projects')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await axiosInstance.post('/auth', {
        name,
        email,
        password,
        password_confirmation: password,
      })
      await mutate()
      router.push('/projects')
    } catch {
      setError('登録に失敗しました。入力内容を確認してください')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h5" component="h1" textAlign="center">
          新規登録
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <TextField
            label="名前"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="メールアドレス"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="パスワード"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            inputProps={{ minLength: 8 }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={submitting}
          >
            {submitting ? '登録中...' : '登録する'}
          </Button>
        </Box>
        <Typography variant="body2" textAlign="center">
          すでにアカウントをお持ちの方は{' '}
          <MuiLink component={Link} href="/sign_in">
            ログイン
          </MuiLink>
        </Typography>
      </Box>
    </Container>
  )
}
