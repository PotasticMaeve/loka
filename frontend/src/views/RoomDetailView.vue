<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api, getApiErrorMessage } from '@/lib/api'
import { formatCurrency, formatInZone, todayInputValue } from '@/lib/format'
import { useAuthStore } from '@/stores/auth'
import type { AvailabilityResponse, Booking, Room } from '@/types/api'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const roomId = computed(() => String(route.params.id))

const room = ref<Room | null>(null)
const availability = ref<AvailabilityResponse | null>(null)
const date = ref(todayInputValue())
const minDate = todayInputValue()

const loadingRoom = ref(true)
const loadingSlots = ref(false)
const submitting = ref(false)

const error = ref('')
const booked = ref<Booking | null>(null)

// Selected hours stay contiguous: the API books one continuous time range.
const selectedHours = ref<number[]>([])

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

const canBook = computed(() => selectedSlots.value.length > 0 && !submitting.value)

function isSelected(hour: number) {
  return selectedHours.value.includes(hour)
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
    const { data } = await api.get<AvailabilityResponse>(
      `/rooms/${roomId.value}/availability`,
      { params: { date: date.value } },
    )
    availability.value = data
  } catch (err) {
    availability.value = null
    error.value = getApiErrorMessage(err)
  } finally {
    loadingSlots.value = false
  }
}

function onDateChange() {
  booked.value = null
  void loadAvailability()
}

async function book() {
  if (!selectionStart.value || !selectionEnd.value) return

  if (!auth.isAuthenticated) {
    await router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }

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
  } catch (err) {
    const message = getApiErrorMessage(err)
    // The slot may have been taken by someone else; refresh the grid first.
    await loadAvailability()
    error.value = message
  } finally {
    submitting.value = false
  }
}

watch(date, onDateChange)

onMounted(async () => {
  await loadRoom()
  if (room.value) {
    await loadAvailability()
  }
})
</script>

<template>
  <div class="space-y-6">
    <RouterLink to="/rooms" class="text-sm font-medium text-indigo-600 hover:text-indigo-700">
      ← Back to rooms
    </RouterLink>

    <p v-if="error" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{{ error }}</p>

    <div v-if="loadingRoom" class="h-40 animate-pulse rounded-xl border border-slate-200 bg-white" />

    <template v-else-if="room">
      <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold">{{ room.name }}</h1>
            <p class="mt-1 text-sm text-slate-600">Fits up to {{ room.capacity }} people</p>
          </div>
          <p class="rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
            {{ formatCurrency(room.pricePerHour) }} / hour
          </p>
        </div>

        <ul v-if="room.facilities.length" class="mt-4 flex flex-wrap gap-2">
          <li
            v-for="facility in room.facilities"
            :key="facility"
            class="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700"
          >
            {{ facility }}
          </li>
        </ul>
      </section>

      <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div>
            <label for="date" class="block text-sm font-medium text-slate-700">Date</label>
            <input
              id="date"
              v-model="date"
              type="date"
              :min="minDate"
              class="mt-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <p v-if="availability" class="text-sm text-slate-600">
            {{ availability.openHour }}:00 – {{ availability.closeHour }}:00 ({{
              availability.timezone
            }})
          </p>
        </div>

        <div v-if="loadingSlots" class="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div v-for="n in 8" :key="n" class="h-14 animate-pulse rounded-lg bg-slate-100" />
        </div>

        <template v-else-if="availability">
          <p v-if="availability.slots.length === 0" class="mt-6 text-sm text-slate-600">
            No slots are open on this date.
          </p>

          <div v-else class="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <button
              v-for="slot in availability.slots"
              :key="slot.hour"
              type="button"
              :disabled="slot.status !== 'AVAILABLE'"
              class="rounded-lg border px-2 py-3 text-sm font-medium transition"
              :class="[
                isSelected(slot.hour)
                  ? 'border-indigo-600 bg-indigo-600 text-white shadow'
                  : slot.status === 'AVAILABLE'
                    ? 'border-slate-300 bg-white text-slate-800 hover:border-indigo-400 hover:bg-indigo-50'
                    : slot.status === 'BOOKED'
                      ? 'cursor-not-allowed border-red-200 bg-red-50 text-red-400 line-through'
                      : 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400',
              ]"
              @click="toggleSlot(slot.hour, slot.status)"
            >
              {{ slot.label }}
            </button>
          </div>

          <ul class="mt-4 flex flex-wrap gap-4 text-xs text-slate-600">
            <li class="flex items-center gap-1.5">
              <span class="h-3 w-3 rounded border border-slate-300 bg-white" /> Available
            </li>
            <li class="flex items-center gap-1.5">
              <span class="h-3 w-3 rounded border border-red-200 bg-red-50" /> Booked
            </li>
            <li class="flex items-center gap-1.5">
              <span class="h-3 w-3 rounded border border-slate-200 bg-slate-50" /> Past
            </li>
            <li class="flex items-center gap-1.5">
              <span class="h-3 w-3 rounded border border-indigo-600 bg-indigo-600" /> Selected
            </li>
          </ul>
        </template>
      </section>

      <section
        v-if="availability && selectedSlots.length > 0"
        class="rounded-xl border border-indigo-200 bg-indigo-50 p-6"
      >
        <h2 class="text-lg font-semibold text-slate-900">Your selection</h2>

        <dl class="mt-4 grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt class="font-medium text-slate-600">Time</dt>
            <dd class="mt-0.5 text-slate-900">
              {{ availability && selectionStart ? formatInZone(selectionStart, availability.timezone) : '' }}
              –
              {{ availability && selectionEnd ? formatInZone(selectionEnd, availability.timezone) : '' }}
            </dd>
          </div>
          <div>
            <dt class="font-medium text-slate-600">Duration</dt>
            <dd class="mt-0.5 text-slate-900">
              {{ selectedSlots.length }} hour{{ selectedSlots.length > 1 ? 's' : '' }}
            </dd>
          </div>
          <div>
            <dt class="font-medium text-slate-600">Total</dt>
            <dd class="mt-0.5 font-semibold text-slate-900">{{ formatCurrency(totalPrice) }}</dd>
          </div>
        </dl>

        <div class="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            :disabled="!canBook"
            class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            @click="book"
          >
            {{ submitting ? 'Booking...' : auth.isAuthenticated ? 'Confirm booking' : 'Log in to book' }}
          </button>
          <button
            type="button"
            class="text-sm font-medium text-slate-600 hover:text-slate-900"
            @click="selectedHours = []"
          >
            Clear selection
          </button>
        </div>

        <p v-if="!auth.isAuthenticated" class="mt-3 text-xs text-slate-600">
          You need an account to reserve a room.
        </p>
      </section>

      <section
        v-if="booked"
        class="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-900"
      >
        <h2 class="text-lg font-semibold">Booking confirmed</h2>
        <p class="mt-1">{{ booked.room.name }}</p>
        <p class="mt-2">
          {{
            availability
              ? `${formatInZone(booked.startTime, availability.timezone)} – ${formatInZone(booked.endTime, availability.timezone)}`
              : ''
          }}
        </p>
        <p class="mt-1 font-semibold">Total: {{ formatCurrency(booked.totalPrice) }}</p>
        <p class="mt-3">
          <RouterLink to="/bookings" class="font-semibold underline">
            View my bookings
          </RouterLink>
        </p>
      </section>
    </template>
  </div>
</template>
