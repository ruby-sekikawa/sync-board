import LogoutIcon from '@mui/icons-material/Logout'
import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '@/hooks/useAuth'

const AUTH_PAGES = ['/sign_in', '/sign_up']

interface Props {
  children: React.ReactNode
}

export default function Layout({ children }: Props) {
  const router = useRouter()
  const { isAuthenticated, currentUser, signOut } = useAuth({
    requireAuth: false,
  })

  const showHeader = !AUTH_PAGES.includes(router.pathname)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {showHeader && (
        <AppBar position="static" elevation={1}>
          <Toolbar>
            <Typography
              variant="h6"
              component={Link}
              href="/projects"
              sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none' }}
            >
              sync-board
            </Typography>
            {isAuthenticated && (
              <>
                <Typography variant="body2" sx={{ mr: 1 }}>
                  {currentUser?.name}
                </Typography>
                <IconButton
                  color="inherit"
                  onClick={signOut}
                  title="ログアウト"
                >
                  <LogoutIcon />
                </IconButton>
              </>
            )}
          </Toolbar>
        </AppBar>
      )}
      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>
    </Box>
  )
}
