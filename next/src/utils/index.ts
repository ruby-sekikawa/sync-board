import { AxiosError } from 'axios'
import axiosInstance from '@/lib/axios'

export const fetcher = (url: string) =>
  axiosInstance
    .get(url)
    .then((res) => res.data)
    .catch((err: AxiosError) => {
      throw err
    })
