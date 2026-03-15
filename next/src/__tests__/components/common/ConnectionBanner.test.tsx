import { render, screen } from '@testing-library/react'
import ConnectionBanner from '@/components/common/ConnectionBanner'

describe('ConnectionBanner', () => {
  it('connectedの場合はバナーを表示しない', () => {
    render(<ConnectionBanner status="connected" />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('disconnectedの場合は警告バナーを表示する', () => {
    render(<ConnectionBanner status="disconnected" />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText(/切断/)).toBeInTheDocument()
  })

  it('reconnectingの場合は再接続中バナーを表示する', () => {
    render(<ConnectionBanner status="reconnecting" />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText(/再接続中/)).toBeInTheDocument()
  })
})
