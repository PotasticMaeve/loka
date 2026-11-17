<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'openvue/button'
import Card from 'openvue/card'
import DatePicker from 'openvue/datepicker'
import Message from 'openvue/message'
import Skeleton from 'openvue/skeleton'
import { useConfirm } from 'openvue/useconfirm'
import { useToast } from 'openvue/usetoast'
import { api, getApiErrorMessage } from '@/lib/api'
import {
  addDays,
  formatCurrency,
  formatDuration,
  formatTimeInZone,
  toDateInput,
} from '@/lib/format'
import { useAuthStore } from '@/stores/auth'
import type { AvailabilityResponse, Booking, Room } from '@/types/api'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const confirm = useConfirm()
const toast = useToast()

const roomId = computed(() => String(route.params.id))

const room = ref<Room | null>(null)
const availability = ref<AvailabilityResponse | null>(null)

const selectedDate = ref<Date>(new Date())
const minDate = new Date()
const maxDate = addDays(new Date(), 60)

const loadingRoom = ref(true)
const loadingSlots = ref(false)
const submitting = ref(false)

const error = ref('')
const booked = ref<Booking | null>(null)

// Selected hours stay contiguous: the API books one continuous time range.
const selectedHours = ref<number[]>([])

const dateParam = computed(() => toDateInput(selectedDate.value))

const selectedSlots = computed(() =>
  (availability.value?.slots ?? [])
    .filter((slot) => selectedHours.value.includes(slot.hour))
    .sort((a, b) => a.hour - b.hour),
)

const selectionStart = computed(() => selectedSlots.value[0]?.startTime ?? null)
const selectionEnd = computed(
  () => selectedSlots.value[selectedSlots.value.length - 1]?.endTime ?? null,
)

const totalPrice = computed(() => {
  const hours = selectedSlots.value.length
  return hours > 0 && room.value ? hours * room.value.pricePerHour : 0
})

const availableCount = computed(
  () => (availability.value?.slots ?? []).filter((slot) => slot.status === 'AVAILABLE').length,
)

const canBook = computed(() => selectedSlots.value.length > 0 && !submitting.value)

function isSelected(hour: number) {
  return selectedHours.value.includes(hour)
}

function slotClasses(status: string, hour: number) {
  if (isSelected(hour)) {
    return 'border-violet-600 bg-violet-600 text-white shadow-[0_10px_20px_-12px_rgba(43,31,224,0.9)] hover:bg-violet-700'
  }
  if (status === 'AVAILABLE') {
    return 'border-line bg-white text-ink hover:-translate-y-0.5 hover:border-violet-400 hover:bg-violet-50 hover:text-violet-700'
  }
  if (status === 'BOOKED') {
    return 'cursor-not-allowed border-violet-200 bg-violet-50 text-muted line-through'
  }
  return 'cursor-not-allowed border-line bg-paper text-muted/50'
}

function toggleSlot(hour: number, status: string) {
  if (status !== 'AVAILABLE') return

  booked.value = null

  const index = selectedHours.value.indexOf(hour)
  if (index >= 0) {
    // Clicking a selected slot shrinks the range so it ends before that slot.
    selectedHours.value = selectedHours.value.slice(0, index)
    return
  }

  if (selectedHours.value.length === 0) {
    selectedHours.value = [hour]
    return
  }

  const min = Math.min(...selectedHours.value)
  const max = Math.max(...selectedHours.value)

  // Extend only when the clicked slot touches the current range.
  if (hour === min - 1 || hour === max + 1) {
    selectedHours.value = [...selectedHours.value, hour].sort((a, b) => a - b)
  } else {
    selectedHours.value = [hour]
  }
}

async function loadRoom() {
  loadingRoom.value = true
  error.value = ''

  try {
    const { data } = await api.get<{ room: Room }>(`/rooms/${roomId.value}`)
    room.value = data.room
  } catch (err) {
    error.value = getApiErrorMessage(err)
  } finally {
    loadingRoom.value = false
  }
}

async function loadAvailability() {
  loadingSlots.value = true
  error.value = ''
  selectedHours.value = []

  try {
    const { data } = await api.get<AvailabilityResponse>(`/rooms/${roomId.value}/availability`, {
      params: { date: dateParam.value },
    })
    availability.value = data
  } catch (err) {
    availability.value = null
    error.value = getApiErrorMessage(err)
  } finally {
    loadingSlots.value = false
  }
}

async function confirmBooking() {
  if (!selectionStart.value || !selectionEnd.value) return

  if (!auth.isAuthenticated) {
    await router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }

  confirm.require({
    header: 'Confirm this booking',
    message: `${room.value?.name ?? 'Room'} · ${formatDuration(selectedSlots.value.length)} · ${formatCurrency(totalPrice.value)}`,
    acceptLabel: 'Book it',
    rejectLabel: 'Not yet',
    accept: () => void book(),
  })
}

async function book() {
  if (!selectionStart.value || !selectionEnd.value) return

  submitting.value = true
  error.value = ''
  booked.value = null

  try {
    const { data } = await api.post<{ booking: Booking }>('/bookings', {
      roomId: roomId.value,
      startTime: selectionStart.value,
      endTime: selectionEnd.value,
    })
    booked.value = data.booking
    await loadAvailability()
    toast.add({
      severity: 'success',
      summary: 'Booking confirmed',
      detail: `${data.booking.room.name} · ${formatCurrency(data.booking.totalPrice)}`,
      life: 4000,
    })
  } catch (err) {
    const message = getApiErrorMessage(err)
    // The slot may have been taken by someone else; refresh the grid first.
    await loadAvailability()
    error.value = message
  } finally {
    submitting.value = false
  }
}

watch(dateParam, () => {
  booked.value = null
  void loadAvailability()
})

onMounted(async () => {
  await loadRoom()
  if (room.value) {
    await loadAvailability()
  }
})
</script>

<template>
  <div class="space-y-6">
    <RouterLink
      to="/rooms"
      class="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-violet-700"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
        <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      All rooms
    </RouterLink>

    <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>

    <div v-if="loadingRoom" class="surface p-6">
      <Skeleton height="2rem" width="40%" />
      <Skeleton height="1rem" width="25%" class="mt-4" />
      <Skeleton height="3rem" class="mt-6" />
    </div>

    <template v-else-if="room">
      <div class="grid gap-6 lg:grid-cols-[1.55fr_1fr] lg:items-start">
        <div class="space-y-6">
          <Card>
            <template #content>
              <div class="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p class="eyebrow">Room</p>
                  <h1 class="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                    {{ room.name }}
                  </h1>
                  <p class="mt-2 text-sm text-slate-500">
                    Fits up to {{ room.capacity }} people
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-xl font-semibold text-slate-900">
                    {{ formatCurrency(room.pricePerHour) }}
                  </p>
                  <p class="text-xs text-slate-500">per hour</p>
                </div>
              </div>

              <ul v-if="room.facilities.length" class="mt-5 flex flex-wrap gap-1.5">
                <li
                  v-for="facility in room.facilities"
                  :key="facility"
                  class="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
                >
                  {{ facility }}
                </li>
              </ul>
            </template>
          </Card>

          <Card>
            <template #content>
              <div class="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <label for="booking-date" class="meta-label">Date</label>
                  <DatePicker
                    v-model="selectedDate"
                    input-id="booking-date"
                    date-format="dd M yy"
                    :min-date="minDate"
                    :max-date="maxDate"
                    :manual-input="false"
                    show-icon
                    icon-display="input"
                    class="mt-2 w-full sm:w-56"
                  />
                </div>

                <div v-if="availability" class="text-right text-sm text-slate-500">
                  <p>
                    Open {{ String(availability.openHour).padStart(2, '0') }}:00 –
                    {{ String(availability.closeHour).padStart(2, '0') }}:00
                  </p>
                  <p class="text-xs">{{ availability.timezone }}</p>
                </div>
              </div>

              <div v-if="loadingSlots" class="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Skeleton v-for="n in 8" :key="n" height="3.25rem" border-radius="10px" />
              </div>

              <template v-else-if="availability">
                <p v-if="availability.slots.length === 0" class="mt-6 text-sm text-slate-500">
                  No slots are open on this date.
                </p>

                <div v-else class="mt-6">
                  <div class="mb-3 flex items-center justify-between">
                    <p class="text-sm font-medium text-slate-700">
                      {{ availableCount }} of {{ availability.slots.length }} hours free
                    </p>
                    <p v-if="selectedSlots.length" class="text-xs font-medium text-violet-700">
                      {{ formatDuration(selectedSlots.length) }} selected
                    </p>
                  </div>

                  <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <button
                      v-for="slot in availability.slots"
                      :key="slot.hour"
                      type="button"
                      :disabled="slot.status !== 'AVAILABLE'"
                      class="rounded-[10px] border px-2 py-3 text-sm font-medium transition"
                      :class="slotClasses(slot.status, slot.hour)"
                      :aria-pressed="isSelected(slot.hour)"
                      @click="toggleSlot(slot.hour, slot.status)"
                    >
                      {{ slot.label }}
                    </button>
                  </div>

                  <ul class="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
                    <li class="flex items-center gap-1.5">
                      <span class="h-3 w-3 rounded border border-slate-300 bg-white" /> Available
                    </li>
                    <li class="flex items-center gap-1.5">
                      <span class="h-3 w-3 rounded border border-violet-200 bg-violet-50" /> Booked
                    </li>
                    <li class="flex items-center gap-1.5">
                      <span class="h-3 w-3 rounded border border-slate-200 bg-slate-50" /> Past
                    </li>
                    <li class="flex items-center gap-1.5">
                      <span class="h-3 w-3 rounded border border-violet-600 bg-violet-600" /> Selected
                    </li>
                  </ul>
                </div>
              </template>
            </template>
          </Card>
        </div>

        <div class="space-y-4 lg:sticky lg:top-24">
          <div v-if="availability && selectedSlots.length > 0" class="surface-dark p-6">
            <p class="font-mono text-[11px] tracking-[0.1em] text-white/70 uppercase">
              Your selection
            </p>

            <dl class="mt-4 space-y-3 text-sm">
              <div class="flex items-baseline justify-between gap-3">
                <dt class="text-white/60">Time</dt>
                <dd class="text-right font-semibold text-white">
                  {{ selectionStart ? formatTimeInZone(selectionStart, availability.timezone) : '' }}
                  –
                  {{ selectionEnd ? formatTimeInZone(selectionEnd, availability.timezone) : '' }}
                </dd>
              </div>
              <div class="flex items-baseline justify-between gap-3">
                <dt class="text-white/60">Duration</dt>
                <dd class="font-semibold text-white">
                  {{ formatDuration(selectedSlots.length) }}
                </dd>
              </div>
              <div class="flex items-end justify-between gap-3 border-t border-white/15 pt-3">
                <dt class="text-white/60">Total</dt>
                <dd class="font-display text-2xl font-extrabold text-violet-200">
                  {{ formatCurrency(totalPrice) }}
                </dd>
              </div>
            </dl>

            <Button
              :label="auth.isAuthenticated ? 'Confirm booking' : 'Log in to book'"
              :loading="submitting"
              :disabled="!canBook"
              class="mt-5 w-full !border-white !bg-white !text-violet-950 hover:!bg-violet-50"
              @click="confirmBooking"
            />

            <button
              type="button"
              class="mt-3 w-full text-center text-sm font-medium text-white/60 transition hover:text-white"
              @click="selectedHours = []"
            >
              Clear selection
            </button>

            <p v-if="!auth.isAuthenticated" class="mt-3 text-xs text-white/70">
              You need an account to reserve a room.
            </p>
          </div>

          <div v-else class="surface border-dashed p-6">
            <p class="text-sm font-semibold text-ink">Nothing selected yet</p>
            <p class="mt-1 text-sm leading-relaxed text-muted">
              Pick one or more free hours on the left. Contiguous hours are booked as a single
              reservation.
            </p>
          </div>

          <div v-if="booked" class="rounded-[26px] border border-line bg-violet-50 p-6">
            <div class="flex items-start gap-3">
              <span class="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink text-violet-200">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="h-4 w-4">
                  <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
              <div class="min-w-0">
                <p class="text-sm font-bold text-ink">Booking confirmed</p>

                <p class="mt-1 text-sm font-medium text-ink/80">{{ booked.room.name }}</p>
                <p class="mt-1 font-mono text-xs text-ink/70">
                  {{
                    availability
                      ? `${formatTimeInZone(booked.startTime, availability.timezone)} – ${formatTimeInZone(booked.endTime, availability.timezone)}`
                      : ''
                  }}
                  · {{ formatCurrency(booked.totalPrice) }}
                </p>
                <RouterLink
                  to="/bookings"
                  class="link-underline mt-2 inline-block text-sm font-bold text-ink"
                >
                  View my bookings
                </RouterLink>
              </div>
            </div>
          </div>

          <div v-if="room.isActive === false" class="rounded-[26px] border border-line bg-white p-5">
            <p class="text-sm font-bold text-ink">Not taking bookings</p>
            <p class="mt-1 text-sm text-ink/70">This room is hidden from the booking page.</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
