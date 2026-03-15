import axios from 'axios'

const TOKEN_KEYS = ['access-token', 'client', 'uid'] as const

const axiosInstance = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api/v1',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

// リクエストインターセプター: localStorageのトークンをヘッダーに付与
axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    TOKEN_KEYS.forEach((key) => {
      const value = localStorage.getItem(key)
      if (value) config.headers.set(key, value)
    })
  }
  return config
})

// レスポンスインターセプター: レスポンスヘッダーのトークンを保存
axiosInstance.interceptors.response.use((response) => {
  if (typeof window !== 'undefined') {
    TOKEN_KEYS.forEach((key) => {
      const value = response.headers[key]
      if (value) localStorage.setItem(key, value)
    })
  }
  return response
})

export default axiosInstance
