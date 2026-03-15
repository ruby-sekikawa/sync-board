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

export default function SignIn() {
  const router = useRouter()
  const { isAuthenticated, isLoading, mutate } = useAuth({ requireAuth: false })
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
      localStorage.removeItem('access-token')
      localStorage.removeItem('client')
      localStorage.removeItem('uid')
      await axiosInstance.post('/auth/sign_in', { email, password })
      await mutate()
      router.push('/projects')
    } catch {
      setError('メールアドレスまたはパスワードが正しくありません')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h5" component="h1" textAlign="center">
          ログイン
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
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
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={submitting}
          >
            {submitting ? 'ログイン中...' : 'ログイン'}
          </Button>
        </Box>
        <Typography variant="body2" textAlign="center">
          アカウントをお持ちでない方は{' '}
          <MuiLink component={Link} href="/sign_up">
            新規登録
          </MuiLink>
        </Typography>
      </Box>
    </Container>
  )
}
