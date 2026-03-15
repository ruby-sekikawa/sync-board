import { createConsumer, Consumer } from '@rails/actioncable'

let consumer: Consumer | null = null

export function getConsumer(): Consumer {
  if (consumer) return consumer

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('access-token') : null
  const client =
    typeof window !== 'undefined' ? localStorage.getItem('client') : null
  const uid = typeof window !== 'undefined' ? localStorage.getItem('uid') : null

  const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:3000/cable'
  const params = new URLSearchParams()
  if (token) params.set('access-token', token)
  if (client) params.set('client', client)
  if (uid) params.set('uid', uid)

  consumer = createConsumer(`${wsUrl}?${params.toString()}`)
  return consumer
}

export function resetConsumer(): void {
  consumer?.disconnect()
  consumer = null
}
