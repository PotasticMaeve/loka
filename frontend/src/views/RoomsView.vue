<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Button from 'openvue/button'
import Message from 'openvue/message'
import Skeleton from 'openvue/skeleton'
import { api, getApiErrorMessage } from '@/lib/api'
import { formatCurrency } from '@/lib/format'
import type { Room } from '@/types/api'

const rooms = ref<Room[]>([])
const loading = ref(true)
const error = ref('')

// Facilities cycle through the palette so a wall of chips stays scannable.
const chipTones = [
  'bg-violet-50 text-violet-900',
  'bg-violet-100 text-violet-900',
  'bg-violet-50 text-violet-800',
  'bg-violet-100 text-violet-800',
]

async function loadRooms() {
  loading.value = true
  error.value = ''

  try {
    const { data } = await api.get<{ rooms: Room[] }>('/rooms')
    rooms.value = data.rooms
  } catch (err) {
    error.value = getApiErrorMessage(err)
  } finally {
    loading.value = false
  }
}

onMounted(loadRooms)
</script>

<template>
  <div class="space-y-8">
    <header class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="eyebrow">Available now</p>
        <h1 class="page-title mt-3">Rooms</h1>
        <p class="page-subtitle max-w-xl">
          Pick a room, choose a date, and reserve the exact hours you need.
        </p>
      </div>
      <Button
        label="Refresh"
        severity="secondary"
        outlined
        :loading="loading"
        @click="loadRooms"
      />
    </header>

    <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>

    <div v-if="loading" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="n in 3" :key="n" class="surface p-6">
        <Skeleton height="1.6rem" width="60%" />
        <Skeleton height="1rem" width="40%" class="mt-4" />
        <Skeleton height="1rem" width="80%" class="mt-2" />
        <Skeleton height="2.6rem" class="mt-6" />
      </div>
    </div>

    <div
      v-else-if="rooms.length === 0"
      class="surface flex flex-col items-center gap-3 border-dashed px-6 py-16 text-center"
    >
      <span class="grid h-12 w-12 place-items-center rounded-2xl bg-violet-600 text-white">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="h-6 w-6">
          <rect x="3" y="4" width="18" height="16" rx="4" />
          <path d="M3 10h18" />
        </svg>
      </span>
      <p class="text-sm font-semibold text-ink">No rooms are listed yet</p>
      <p class="max-w-sm text-sm text-muted">
        An administrator needs to publish a room before bookings can start.
      </p>
    </div>

    <div v-else class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <article
        v-for="room in rooms"
        :key="room.id"
        class="surface group flex flex-col p-6 transition hover:-translate-y-1 hover:border-violet-300 hover:shadow-[0_2px_0_#e0dacb,0_28px_52px_-30px_rgba(43,31,224,0.35)]"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="text-xl font-bold tracking-tight text-ink">{{ room.name }}</h2>
            <p class="mt-1 text-sm text-muted">Fits up to {{ room.capacity }} people</p>
          </div>
          <span
            class="shrink-0 rounded-full bg-violet-600 px-3 py-1 font-mono text-xs font-semibold text-white"
          >
            {{ formatCurrency(room.pricePerHour) }}/h
          </span>
        </div>

        <ul v-if="room.facilities.length" class="mt-5 flex flex-wrap gap-1.5">
          <li
            v-for="(facility, index) in room.facilities"
            :key="facility"
            class="rounded-full px-2.5 py-1 text-xs font-medium"
            :class="chipTones[index % chipTones.length]"
          >
            {{ facility }}
          </li>
        </ul>
        <p v-else class="mt-5 text-xs text-muted">No facilities listed</p>

        <RouterLink :to="{ name: 'room-detail', params: { id: room.id } }" class="mt-6 block">
          <Button label="View availability" class="w-full" severity="secondary" outlined />
        </RouterLink>
      </article>
    </div>
  </div>
</template>
