import { useEffect, useRef, useState } from 'react'
import { useBoard } from './useBoard'
import { getConsumer } from '@/lib/actioncable'

export type ConnectionStatus =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'reconnecting'

interface BoardChannelMessage {
  type:
    | 'task_created'
    | 'task_updated'
    | 'task_moved'
    | 'task_deleted'
    | 'column_created'
    | 'column_updated'
    | 'column_deleted'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export function useBoardChannel(
  boardId: string | undefined,
  projectId: string | undefined,
) {
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>('connecting')
  const { mutate } = useBoard(boardId, projectId)
  const retryCountRef = useRef(0)
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!boardId) return

    const consumer = getConsumer()
    const subscription = consumer.subscriptions.create(
      { channel: 'BoardChannel', board_id: boardId },
      {
        connected() {
          setConnectionStatus('connected')
          retryCountRef.current = 0
          if (retryTimerRef.current) {
            clearTimeout(retryTimerRef.current)
            retryTimerRef.current = null
          }
          // 再接続後はサーバー最新状態を再取得
          mutate()
        },

        disconnected() {
          setConnectionStatus('disconnected')
          scheduleReconnect()
        },

        received(data: BoardChannelMessage) {
          handleMessage(data)
        },
      },
    )

    function scheduleReconnect() {
      if (retryCountRef.current >= 5) return
      const delay = Math.min(1000 * 2 ** retryCountRef.current, 30000)
      retryCountRef.current += 1
      setConnectionStatus('reconnecting')
      retryTimerRef.current = setTimeout(() => {
        // Action Cableは自動再接続するが、状態を更新
        setConnectionStatus('disconnected')
      }, delay)
    }

    function handleMessage(data: BoardChannelMessage) {
      switch (data.type) {
        case 'task_created':
        case 'task_updated':
        case 'task_moved':
        case 'task_deleted':
        case 'column_created':
        case 'column_updated':
        case 'column_deleted':
          mutate()
          break
        default:
          break
      }
    }

    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current)
      subscription.unsubscribe()
    }
  }, [boardId, mutate])

  return { connectionStatus }
}
