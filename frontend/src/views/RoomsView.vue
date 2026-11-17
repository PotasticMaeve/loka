<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { api, getApiErrorMessage } from '@/lib/api'
import { formatCurrency } from '@/lib/format'
import type { Room } from '@/types/api'

const rooms = ref<Room[]>([])
const loading = ref(true)
const error = ref('')

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
  <div class="space-y-6">
    <header class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold">Rooms</h1>
        <p class="mt-1 text-sm text-slate-600">
          Pick a room, choose a date, and reserve the hours you need.
        </p>
      </div>
      <button
        type="button"
        class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        :disabled="loading"
        @click="loadRooms"
      >
        Refresh
      </button>
    </header>

    <p v-if="error" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
      {{ error }}
    </p>

    <div v-if="loading" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="n in 3"
        :key="n"
        class="h-40 animate-pulse rounded-xl border border-slate-200 bg-white"
      />
    </div>

    <p
      v-else-if="rooms.length === 0"
      class="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-600"
    >
      No rooms are available yet. Check back later.
    </p>

    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <article
        v-for="room in rooms"
        :key="room.id"
        class="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow"
      >
        <div class="flex items-start justify-between gap-3">
          <h2 class="text-lg font-semibold text-slate-900">{{ room.name }}</h2>
          <span class="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
            {{ formatCurrency(room.pricePerHour) }} / hour
          </span>
        </div>

        <p class="mt-1 text-sm text-slate-600">Fits up to {{ room.capacity }} people</p>

        <ul v-if="room.facilities.length" class="mt-3 flex flex-wrap gap-1.5">
          <li
            v-for="facility in room.facilities"
            :key="facility"
            class="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-700"
          >
            {{ facility }}
          </li>
        </ul>
        <p v-else class="mt-3 text-xs text-slate-400">No facilities listed</p>

        <RouterLink
          :to="{ name: 'room-detail', params: { id: room.id } }"
          class="mt-5 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          View availability
        </RouterLink>
      </article>
    </div>
  </div>
</template>
