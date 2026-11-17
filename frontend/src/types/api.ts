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

export interface Room {
  id: string
  name: string
  capacity: number
  pricePerHour: number
  facilities: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface RoomSummary {
  id: string
  name: string
  capacity: number
  pricePerHour: number
}

export type SlotStatus = 'AVAILABLE' | 'BOOKED' | 'PAST'

export interface AvailabilitySlot {
  hour: number
  startTime: string
  endTime: string
  label: string
  status: SlotStatus
}

export interface AvailabilityResponse {
  room: RoomSummary
  date: string
  timezone: string
  openHour: number
  closeHour: number
  slots: AvailabilitySlot[]
}

export type BookingStatus = 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'

export interface BookingUser {
  id: string
  name: string
  email: string
}

export interface Booking {
  id: string
  userId: string
  roomId: string
  startTime: string
  endTime: string
  totalPrice: number
  status: BookingStatus
  createdAt: string
  updatedAt: string
  room: RoomSummary
  user?: BookingUser
}

export interface Settings {
  id: number
  openHour: number
  closeHour: number
  timezone: string
  updatedAt: string
}

export interface ApiErrorBody {
  error?: {
    code?: string
    message?: string
    details?: Array<{ field?: string; message?: string }>
  }
}
