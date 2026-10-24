import axios, { AxiosHeaders } from 'axios'
import { useAuthStore } from '@/stores/authStore'
import { getDeviceId } from '@/utils/device'

declare module 'axios' {
  export interface AxiosRequestConfig {
    suppressAuthRedirect?: boolean
    _retry?: boolean
  }
}

export interface GlobalResponse<T> {
  code: string
  message: string
  data: T
}

export async function requestData<T>(
  promise: Promise<{ data: GlobalResponse<T> }>
): Promise<T> {
  const response = await promise
  return response.data.data
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
  withCredentials: true,
})

// Attach Bearer token and Device ID to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  const headers = AxiosHeaders.from(config.headers)
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  if (!headers.has('X-Device-Id')) {
    headers.set('X-Device-Id', getDeviceId())
  }
  config.headers = headers
  return config
})

let isRefreshing = false
let refreshPromise: Promise<string | null> | null = null

// Response interceptor for handling 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.suppressAuthRedirect
    ) {
      originalRequest._retry = true
      const refreshToken = useAuthStore.getState().refreshToken
      if (!refreshToken) {
        useAuthStore.getState().clearAuth()
        throw error
      }

      if (!isRefreshing) {
        isRefreshing = true
        refreshPromise = api
          .post<GlobalResponse<{ access_token: string }>>('/auth/refresh', {
            refresh_token: refreshToken,
          })
          .then((res) => {
            const newToken = res.data.data.access_token
            useAuthStore.getState().setToken(newToken)
            return newToken
          })
          .catch(() => {
            useAuthStore.getState().clearAuth()
            return null
          })
          .finally(() => {
            isRefreshing = false
            refreshPromise = null
          })
      }

      const newToken = await refreshPromise
      if (newToken) {
        originalRequest.headers = AxiosHeaders.from(originalRequest.headers)
        originalRequest.headers.set('Authorization', `Bearer ${newToken}`)
        return api(originalRequest)
      }
    }
    throw error
  }
)

export default api
