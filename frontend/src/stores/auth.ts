import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { api, TOKEN_KEY, USER_KEY } from '@/lib/api'
import type { AuthResponse, User } from '@/types/api'

function readStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const user = ref<User | null>(readStoredUser())

  const isAuthenticated = computed(() => Boolean(token.value))
  const isAdmin = computed(() => user.value?.role === 'ADMIN')

  function saveSession(auth: AuthResponse) {
    token.value = auth.token
    user.value = auth.user
    localStorage.setItem(TOKEN_KEY, auth.token)
    localStorage.setItem(USER_KEY, JSON.stringify(auth.user))
  }

  async function login(email: string, password: string) {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password })
    saveSession(data)
  }

  async function register(name: string, email: string, password: string) {
    const { data } = await api.post<AuthResponse>('/auth/register', { name, email, password })
    saveSession(data)
  }

  async function fetchMe() {
    const { data } = await api.get<{ user: User }>('/auth/me')
    user.value = data.user
    localStorage.setItem(USER_KEY, JSON.stringify(data.user))
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  return {
    token,
    user,
    isAuthenticated,
    isAdmin,
    login,
    register,
    fetchMe,
    logout,
  }
})
