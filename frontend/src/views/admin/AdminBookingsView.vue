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
const busyId = ref<string | null>(null)

async function loadBookings() {
  loading.value = true
  error.value = ''

  try {
    const { data } = await api.get<{ bookings: Booking[] }>('/bookings', {
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
    // Keep the default timezone when settings cannot be loaded.
  }
}

async function changeFilter(value: Filter) {
  filter.value = value
  await loadBookings()
}

async function updateStatus(booking: Booking, status: 'CANCELLED' | 'COMPLETED') {
  busyId.value = booking.id
  error.value = ''

  try {
    await api.patch(`/bookings/${booking.id}/status`, { status })
    await loadBookings()
  } catch (err) {
    error.value = getApiErrorMessage(err)
  } finally {
    busyId.value = null
  }
}

onMounted(async () => {
  await Promise.all([loadBookings(), loadSettings()])
})
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-center justify-between gap-3">
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

      <button
        type="button"
        class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        :disabled="loading"
        @click="loadBookings"
      >
        Refresh
      </button>
    </div>

    <p v-if="error" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{{ error }}</p>

    <div v-if="loading" class="space-y-2">
      <div v-for="n in 4" :key="n" class="h-12 animate-pulse rounded-lg border border-slate-200 bg-white" />
    </div>

    <div v-else class="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table class="min-w-full divide-y divide-slate-200 text-sm">
        <thead class="bg-slate-50 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase">
          <tr>
            <th class="px-4 py-3">User</th>
            <th class="px-4 py-3">Room</th>
            <th class="px-4 py-3">Time</th>
            <th class="px-4 py-3">Total</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="booking in bookings" :key="booking.id">
            <td class="px-4 py-3">
              <p class="font-medium text-slate-900">{{ booking.user?.name ?? '—' }}</p>
              <p class="text-xs text-slate-500">{{ booking.user?.email ?? '' }}</p>
            </td>
            <td class="px-4 py-3 text-slate-600">{{ booking.room.name }}</td>
            <td class="px-4 py-3 text-slate-600">
              <p>{{ formatInZone(booking.startTime, timezone) }}</p>
              <p class="text-xs text-slate-500">until {{ formatInZone(booking.endTime, timezone) }}</p>
            </td>
            <td class="px-4 py-3 font-medium text-slate-900">
              {{ formatCurrency(booking.totalPrice) }}
            </td>
            <td class="px-4 py-3"><StatusBadge :status="booking.status" /></td>
            <td class="px-4 py-3">
              <div v-if="booking.status === 'CONFIRMED'" class="flex justify-end gap-2">
                <button
                  type="button"
                  :disabled="busyId === booking.id"
                  class="rounded-md border border-emerald-300 px-2.5 py-1 text-xs font-medium text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-60"
                  @click="updateStatus(booking, 'COMPLETED')"
                >
                  Complete
                </button>
                <button
                  type="button"
                  :disabled="busyId === booking.id"
                  class="rounded-md border border-red-300 px-2.5 py-1 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                  @click="updateStatus(booking, 'CANCELLED')"
                >
                  Cancel
                </button>
              </div>
              <p v-else class="text-right text-xs text-slate-400">—</p>
            </td>
          </tr>
          <tr v-if="bookings.length === 0">
            <td colspan="6" class="px-4 py-10 text-center text-slate-500">
              No bookings match this filter.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
