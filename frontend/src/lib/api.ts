import axios from 'axios'
import type { ApiErrorBody } from '@/types/api'

export const TOKEN_KEY = 'loka_token'
export const USER_KEY = 'loka_user'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export const api = axios.create({ baseURL })

// Attach the JWT to every request when the user is signed in.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// A 401 on a normal endpoint means the token is missing, invalid, or expired.
// Clear the session and send the user to the login page.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRequest =
      typeof error.config?.url === 'string' &&
      (error.config.url.includes('/auth/login') || error.config.url.includes('/auth/register'))

    if (error.response?.status === 401 && !isAuthRequest) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    }

    return Promise.reject(error)
  },
)

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const details = error.response?.data?.error?.details
    if (details?.length) {
      return details.map((detail) => detail.message ?? '').filter(Boolean).join(' ')
    }
    return error.response?.data?.error?.message ?? error.message
  }

  return error instanceof Error ? error.message : 'Something went wrong'
}
