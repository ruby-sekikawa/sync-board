import { renderHook, act } from '@testing-library/react'
import { useBoardChannel } from '@/hooks/useBoardChannel'

type ChannelCallbacks = {
  connected: () => void
  disconnected: () => void
  received: (data: unknown) => void
}

// @rails/actioncable をモック
const mockSubscription = {
  unsubscribe: jest.fn(),
}
const mockConsumer = {
  subscriptions: {
    create: jest.fn(() => mockSubscription),
  },
  disconnect: jest.fn(),
}

jest.mock('@/lib/actioncable', () => ({
  getConsumer: () => mockConsumer,
  resetConsumer: jest.fn(),
}))

const mockMutate = jest.fn()
jest.mock('@/hooks/useBoard', () => ({
  useBoard: () => ({
    board: { id: 1, columns: [] },
    mutate: mockMutate,
  }),
}))

function getCallbacks(): ChannelCallbacks {
  const calls = mockConsumer.subscriptions.create.mock.calls as unknown[][]
  return calls[0][1] as ChannelCallbacks
}

describe('useBoardChannel', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('マウント時にBoardChannelをサブスクライブする', () => {
    renderHook(() => useBoardChannel('1', '1'))
    expect(mockConsumer.subscriptions.create).toHaveBeenCalledWith(
      { channel: 'BoardChannel', board_id: '1' },
      expect.objectContaining({
        received: expect.any(Function),
        connected: expect.any(Function),
        disconnected: expect.any(Function),
      }),
    )
  })

  it('アンマウント時にアンサブスクライブする', () => {
    const { unmount } = renderHook(() => useBoardChannel('1', '1'))
    unmount()
    expect(mockSubscription.unsubscribe).toHaveBeenCalled()
  })

  it('connected時にconnectionStatusがconnectedになる', () => {
    const { result } = renderHook(() => useBoardChannel('1', '1'))
    const callbacks = getCallbacks()

    act(() => {
      callbacks.connected()
    })

    expect(result.current.connectionStatus).toBe('connected')
  })

  it('disconnected時にconnectionStatusがreconnectingになる（リトライあり）', () => {
    const { result } = renderHook(() => useBoardChannel('1', '1'))
    const callbacks = getCallbacks()

    act(() => {
      callbacks.disconnected()
    })

    expect(['disconnected', 'reconnecting']).toContain(
      result.current.connectionStatus,
    )
  })

  it('task_moved メッセージ受信時にmutateを呼ぶ', () => {
    renderHook(() => useBoardChannel('1', '1'))
    const callbacks = getCallbacks()

    act(() => {
      callbacks.received({
        type: 'task_moved',
        task: { id: 1, column_id: 2, position: 65536 },
        previous_column_id: 1,
      })
    })

    expect(mockMutate).toHaveBeenCalled()
  })

  it('task_created メッセージ受信時にmutateを呼ぶ', () => {
    renderHook(() => useBoardChannel('1', '1'))
    const callbacks = getCallbacks()

    act(() => {
      callbacks.received({ type: 'task_created', task: { id: 2 } })
    })

    expect(mockMutate).toHaveBeenCalled()
  })
})
