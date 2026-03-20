import LogoutIcon from '@mui/icons-material/Logout'
import ViewKanbanIcon from '@mui/icons-material/ViewKanban'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Tooltip,
  Divider,
} from '@mui/material'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '@/hooks/useAuth'

const AUTH_PAGES = ['/sign_in', '/sign_up']

interface Props {
  children: React.ReactNode
}

function getInitials(name: string): string {
  return name.slice(0, 1).toUpperCase()
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
        <AppBar
          position="static"
          color="default"
          elevation={0}
          sx={{
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'white',
          }}
        >
          <Toolbar sx={{ minHeight: '52px !important', px: 2 }}>
            <Box
              component={Link}
              href="/projects"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                textDecoration: 'none',
                color: 'primary.main',
                flexGrow: 1,
              }}
            >
              <ViewKanbanIcon sx={{ fontSize: 22 }} />
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                sx={{ letterSpacing: 0.5, color: 'text.primary' }}
              >
                sync-board
              </Typography>
            </Box>
            {isAuthenticated && currentUser && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar
                    sx={{
                      width: 28,
                      height: 28,
                      fontSize: '0.75rem',
                      bgcolor: 'primary.main',
                    }}
                  >
                    {getInitials(currentUser.name)}
                  </Avatar>
                  <Typography variant="body2" color="text.secondary">
                    {currentUser.name}
                  </Typography>
                </Box>
                <Divider orientation="vertical" flexItem sx={{ my: 1 }} />
                <Tooltip title="ログアウト">
                  <IconButton size="small" onClick={signOut} color="default">
                    <LogoutIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
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
