import { Alert, Collapse, CircularProgress, Box } from '@mui/material'
import type { ConnectionStatus } from '@/hooks/useBoardChannel'

interface Props {
  status: ConnectionStatus
}

export default function ConnectionBanner({ status }: Props) {
  if (status === 'connected' || status === 'connecting') return null

  return (
    <Collapse in>
      <Alert
        severity={status === 'reconnecting' ? 'warning' : 'error'}
        icon={
          status === 'reconnecting' ? <CircularProgress size={16} /> : undefined
        }
        sx={{ borderRadius: 0 }}
      >
        <Box component="span">
          {status === 'reconnecting'
            ? '再接続中...'
            : 'サーバーとの接続が切断されました'}
        </Box>
      </Alert>
    </Collapse>
  )
}
