<script setup lang="ts">
import { onMounted, ref } from 'vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { api, getApiErrorMessage } from '@/lib/api'
import { formatCurrency, formatInZone } from '@/lib/format'
import type { Booking, BookingStatus, Settings } from '@/types/api'

type Filter = BookingStatus | 'ALL'

const filters: Array<{ value: Filter; label: string }> = [
  { value: 'ALL', label: 'All' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

const bookings = ref<Booking[]>([])
const filter = ref<Filter>('ALL')
const timezone = ref('Asia/Jakarta')

const loading = ref(true)
const error = ref('')
const cancellingId = ref<string | null>(null)

const CANCEL_CUTOFF_MS = 2 * 60 * 60 * 1000

function canCancel(booking: Booking): boolean {
  return (
    booking.status === 'CONFIRMED' &&
    new Date(booking.startTime).getTime() - Date.now() >= CANCEL_CUTOFF_MS
  )
}

async function loadBookings() {
  loading.value = true
  error.value = ''

  try {
    const { data } = await api.get<{ bookings: Booking[] }>('/bookings/me', {
      params: filter.value === 'ALL' ? {} : { status: filter.value },
    })
    bookings.value = data.bookings
  } catch (err) {
    error.value = getApiErrorMessage(err)
  } finally {
    loading.value = false
  }
}

async function loadSettings() {
  try {
    const { data } = await api.get<{ settings: Settings }>('/settings')
    timezone.value = data.settings.timezone
  } catch {
    // Fall back to the default timezone if settings are unreachable.
  }
}

async function changeFilter(value: Filter) {
  filter.value = value
  await loadBookings()
}

async function cancelBooking(booking: Booking) {
  cancellingId.value = booking.id
  error.value = ''

  try {
    await api.patch(`/bookings/${booking.id}/cancel`)
    await loadBookings()
  } catch (err) {
    error.value = getApiErrorMessage(err)
  } finally {
    cancellingId.value = null
  }
}

onMounted(async () => {
  await Promise.all([loadBookings(), loadSettings()])
})
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold">My bookings</h1>
        <p class="mt-1 text-sm text-slate-600">
          Cancel a reservation up to 2 hours before it starts.
        </p>
      </div>
      <RouterLink
        to="/rooms"
        class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
      >
        Book another room
      </RouterLink>
    </header>

    <div class="flex flex-wrap gap-2">
      <button
        v-for="option in filters"
        :key="option.value"
        type="button"
        class="rounded-full border px-3 py-1.5 text-sm font-medium transition"
        :class="
          filter === option.value
            ? 'border-indigo-600 bg-indigo-600 text-white'
            : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
        "
        @click="changeFilter(option.value)"
      >
        {{ option.label }}
      </button>
    </div>

    <p v-if="error" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{{ error }}</p>

    <div v-if="loading" class="space-y-3">
      <div v-for="n in 3" :key="n" class="h-24 animate-pulse rounded-xl border border-slate-200 bg-white" />
    </div>

    <p
      v-else-if="bookings.length === 0"
      class="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-600"
    >
      No bookings yet.
      <RouterLink to="/rooms" class="font-semibold text-indigo-600 hover:text-indigo-700">
        Browse rooms
      </RouterLink>
      to make your first reservation.
    </p>

    <ul v-else class="space-y-3">
      <li
        v-for="booking in bookings"
        :key="booking.id"
        class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 class="text-lg font-semibold text-slate-900">{{ booking.room.name }}</h2>
            <p class="mt-1 text-sm text-slate-600">
              {{ formatInZone(booking.startTime, timezone) }} –
              {{ formatInZone(booking.endTime, timezone) }}
            </p>
          </div>
          <StatusBadge :status="booking.status" />
        </div>

        <dl class="mt-4 grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt class="font-medium text-slate-500">Total</dt>
            <dd class="mt-0.5 font-semibold text-slate-900">
              {{ formatCurrency(booking.totalPrice) }}
            </dd>
          </div>
          <div>
            <dt class="font-medium text-slate-500">Booked on</dt>
            <dd class="mt-0.5 text-slate-900">
              {{ formatInZone(booking.createdAt, timezone) }}
            </dd>
          </div>
          <div>
            <dt class="font-medium text-slate-500">Booking ID</dt>
            <dd class="mt-0.5 font-mono text-xs text-slate-500">{{ booking.id }}</dd>
          </div>
        </dl>

        <div
          v-if="booking.status === 'CONFIRMED'"
          class="mt-4 flex flex-wrap items-center gap-3"
        >
          <button
            v-if="canCancel(booking)"
            type="button"
            :disabled="cancellingId === booking.id"
            class="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            @click="cancelBooking(booking)"
          >
            {{ cancellingId === booking.id ? 'Cancelling...' : 'Cancel booking' }}
          </button>
          <p v-else class="text-xs text-slate-500">
            Cancellation closes 2 hours before the start time.
          </p>
        </div>
      </li>
    </ul>
  </div>
</template>
