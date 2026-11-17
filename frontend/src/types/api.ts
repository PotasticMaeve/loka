export type Role = 'USER' | 'ADMIN'

export interface User {
  id: string
  email: string
  name: string
  role: Role
  createdAt: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface ApiErrorBody {
  error?: {
    code?: string
    message?: string
    details?: Array<{ field?: string; message?: string }>
  }
}
