import { useRouter } from 'next/router'
import { useEffect } from 'react'
import useSWR from 'swr'
import { resetConsumer } from '@/lib/actioncable'
import axiosInstance from '@/lib/axios'

interface CurrentUser {
  id: number
  email: string
  name: string
  image: string | null
}

const fetchCurrentUser = (url: string) =>
  axiosInstance
    .get<{ id: number; email: string; name: string; image: string | null }>(url)
    .then((res) => res.data)

export function useAuth({
  requireAuth = true,
}: { requireAuth?: boolean } = {}) {
  const router = useRouter()
  const {
    data: currentUser,
    error,
    mutate,
    isLoading,
  } = useSWR<CurrentUser>('/current/user', fetchCurrentUser, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  })

  const isAuthenticated = !!currentUser && !error

  useEffect(() => {
    if (!requireAuth || isLoading) return
    if (!isAuthenticated) {
      router.push('/sign_in')
    }
  }, [isAuthenticated, isLoading, requireAuth, router])

  const signOut = async () => {
    await axiosInstance.delete('/auth/sign_out').catch(() => {})
    localStorage.removeItem('access-token')
    localStorage.removeItem('client')
    localStorage.removeItem('uid')
    resetConsumer()
    await mutate(undefined, false)
    router.push('/sign_in')
  }

  return { currentUser, isAuthenticated, isLoading, signOut, mutate }
}
