<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import Button from 'openvue/button'
import Card from 'openvue/card'
import Message from 'openvue/message'
import Select from 'openvue/select'
import SelectButton from 'openvue/selectbutton'
import Skeleton from 'openvue/skeleton'
import { useConfirm } from 'openvue/useconfirm'
import { useToast } from 'openvue/usetoast'
import StatusBadge from '@/components/StatusBadge.vue'
import { api, getApiErrorMessage } from '@/lib/api'
import { formatCurrency, formatDayInZone, formatTimeInZone } from '@/lib/format'
import type { Booking, BookingStatus, Settings } from '@/types/api'

type Filter = BookingStatus | 'ALL'

const filters: Array<{ label: string; value: Filter }> = [
  { label: 'All', value: 'ALL' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
]

const confirm = useConfirm()
const toast = useToast()

const bookings = ref<Booking[]>([])
const filter = ref<Filter>('ALL')
const timezone = ref('Asia/Jakarta')

const loading = ref(true)
const error = ref('')
const cancellingId = ref<string | null>(null)

const CANCEL_CUTOFF_MS = 2 * 60 * 60 * 1000

const upcomingCount = computed(
  () => bookings.value.filter((booking) => booking.status === 'CONFIRMED').length,
)

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

function askCancel(booking: Booking) {
  confirm.require({
    header: 'Cancel this booking?',
    message: `${booking.room.name} · ${formatDayInZone(booking.startTime, timezone.value)}. This cannot be undone.`,
    acceptLabel: 'Cancel booking',
    rejectLabel: 'Keep it',
    acceptClass: 'p-button-danger',
    accept: () => void cancelBooking(booking),
  })
}

async function cancelBooking(booking: Booking) {
  cancellingId.value = booking.id
  error.value = ''

  try {
    await api.patch(`/bookings/${booking.id}/cancel`)
    await loadBookings()
    toast.add({
      severity: 'info',
      summary: 'Booking cancelled',
      detail: booking.room.name,
      life: 3500,
    })
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
  <div class="space-y-8">
    <header class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="eyebrow">Your reservations</p>
        <h1 class="page-title mt-3">My bookings</h1>
        <p class="page-subtitle">
          {{ upcomingCount }} confirmed · cancel up to 2 hours before the start time.
        </p>
      </div>
      <RouterLink to="/rooms">
        <Button label="Book another room" />
      </RouterLink>
    </header>

    <!-- Mobile: a dropdown never clips. Desktop: segmented control. -->
    <div class="sm:hidden">
      <Select
        v-model="filter"
        :options="filters"
        option-label="label"
        option-value="value"
        class="w-full"
        @change="changeFilter(filter)"
      />
    </div>
    <div class="hidden overflow-x-auto sm:block">
      <SelectButton
        v-model="filter"
        :options="filters"
        option-label="label"
        option-value="value"
        :allow-empty="false"
        @change="changeFilter(filter)"
      />
    </div>

    <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>

    <div v-if="loading" class="space-y-4" aria-hidden="true">
      <div v-for="n in 3" :key="n" class="surface p-6">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0 flex-1">
            <Skeleton height="1.5rem" width="45%" />
            <Skeleton height="0.9rem" width="65%" class="mt-3" />
          </div>
          <Skeleton height="1.6rem" width="6rem" border-radius="999px" />
        </div>

        <div class="mt-5 grid gap-4 border-t border-line pt-4 sm:grid-cols-3">
          <div v-for="meta in 3" :key="meta">
            <Skeleton height="0.7rem" width="45%" />
            <Skeleton height="1rem" width="70%" class="mt-2" />
          </div>
        </div>
      </div>
    </div>

    <div
      v-else-if="bookings.length === 0"
      class="surface flex flex-col items-center gap-3 border-dashed px-6 py-16 text-center"
    >
      <span class="grid h-12 w-12 place-items-center rounded-2xl bg-violet-600 text-white">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="h-6 w-6">
          <path d="M8 2v4M16 2v4M3 10h18" stroke-linecap="round" />
          <rect x="3" y="4" width="18" height="18" rx="4" />
        </svg>
      </span>
      <p class="text-sm font-semibold text-ink">No bookings in this view</p>
      <p class="max-w-sm text-sm text-muted">
        Browse the rooms and pick a free hour — it takes about twenty seconds.
      </p>
      <RouterLink to="/rooms" class="mt-2">
        <Button label="Browse rooms" severity="secondary" outlined />
      </RouterLink>
    </div>

    <div v-else class="space-y-4">
      <Card v-for="booking in bookings" :key="booking.id">
        <template #content>
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 class="text-xl font-bold tracking-tight text-ink">{{ booking.room.name }}</h2>
              <p class="mt-1 font-mono text-sm text-muted">
                {{ formatDayInZone(booking.startTime, timezone) }} ·
                {{ formatTimeInZone(booking.startTime, timezone) }} –
                {{ formatTimeInZone(booking.endTime, timezone) }}
              </p>
            </div>
            <StatusBadge :status="booking.status" />
          </div>

          <dl class="mt-5 grid gap-4 border-t border-line pt-4 sm:grid-cols-3">
            <div>
              <dt class="meta-label">Total</dt>
              <dd class="mt-1 font-display text-lg font-extrabold text-ink">
                {{ formatCurrency(booking.totalPrice) }}
              </dd>
            </div>
            <div>
              <dt class="meta-label">Booked on</dt>
              <dd class="meta-value">{{ formatDayInZone(booking.createdAt, timezone) }}</dd>
            </div>
            <div>
              <dt class="meta-label">Booking ID</dt>
              <dd class="mt-1 truncate font-mono text-xs text-muted">{{ booking.id }}</dd>
            </div>
          </dl>

          <div v-if="booking.status === 'CONFIRMED'" class="mt-5 flex flex-wrap items-center gap-3">
            <Button
              v-if="canCancel(booking)"
              label="Cancel booking"
              severity="danger"
              outlined
              size="small"
              class="!border-red-400 !text-red-600 hover:!border-red-500 hover:!bg-red-50 hover:!text-red-700"
              :loading="cancellingId === booking.id"
              @click="askCancel(booking)"
            />
            <p v-else class="text-xs text-muted">
              Cancellation closes 2 hours before the start time.
            </p>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>
