<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { api, getApiErrorMessage } from '@/lib/api'
import { formatCurrency } from '@/lib/format'
import type { Room } from '@/types/api'

const rooms = ref<Room[]>([])
const loading = ref(true)
const error = ref('')
const saving = ref(false)
const busyId = ref<string | null>(null)

const formOpen = ref(false)
const editingId = ref<string | null>(null)
const form = reactive({
  name: '',
  capacity: 1,
  pricePerHour: 0,
  facilities: '',
  isActive: true,
})

function resetForm() {
  editingId.value = null
  form.name = ''
  form.capacity = 1
  form.pricePerHour = 0
  form.facilities = ''
  form.isActive = true
}

function openCreate() {
  resetForm()
  formOpen.value = true
  error.value = ''
}

function openEdit(room: Room) {
  editingId.value = room.id
  form.name = room.name
  form.capacity = room.capacity
  form.pricePerHour = room.pricePerHour
  form.facilities = room.facilities.join(', ')
  form.isActive = room.isActive
  formOpen.value = true
  error.value = ''
}

function closeForm() {
  formOpen.value = false
  resetForm()
}

function parseFacilities(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

async function loadRooms() {
  loading.value = true
  error.value = ''

  try {
    const { data } = await api.get<{ rooms: Room[] }>('/rooms/all')
    rooms.value = data.rooms
  } catch (err) {
    error.value = getApiErrorMessage(err)
  } finally {
    loading.value = false
  }
}

async function save() {
  saving.value = true
  error.value = ''

  const payload = {
    name: form.name.trim(),
    capacity: Number(form.capacity),
    pricePerHour: Number(form.pricePerHour),
    facilities: parseFacilities(form.facilities),
    isActive: form.isActive,
  }

  try {
    if (editingId.value) {
      await api.patch(`/rooms/${editingId.value}`, payload)
    } else {
      await api.post('/rooms', payload)
    }
    closeForm()
    await loadRooms()
  } catch (err) {
    error.value = getApiErrorMessage(err)
  } finally {
    saving.value = false
  }
}

async function toggleActive(room: Room) {
  busyId.value = room.id
  error.value = ''

  try {
    if (room.isActive) {
      await api.delete(`/rooms/${room.id}`)
    } else {
      await api.patch(`/rooms/${room.id}`, { isActive: true })
    }
    await loadRooms()
  } catch (err) {
    error.value = getApiErrorMessage(err)
  } finally {
    busyId.value = null
  }
}

onMounted(loadRooms)
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <p class="text-sm text-slate-600">{{ rooms.length }} room(s) total</p>
      <div class="flex gap-2">
        <button
          type="button"
          class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          :disabled="loading"
          @click="loadRooms"
        >
          Refresh
        </button>
        <button
          type="button"
          class="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          @click="openCreate"
        >
          New room
        </button>
      </div>
    </div>

    <p v-if="error" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{{ error }}</p>

    <form
      v-if="formOpen"
      class="space-y-4 rounded-xl border border-indigo-200 bg-white p-5 shadow-sm"
      @submit.prevent="save"
    >
      <h2 class="text-lg font-semibold">
        {{ editingId ? 'Edit room' : 'New room' }}
      </h2>

      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label for="room-name" class="block text-sm font-medium text-slate-700">Name</label>
          <input
            id="room-name"
            v-model="form.name"
            type="text"
            required
            minlength="2"
            maxlength="80"
            class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        <div>
          <label for="room-capacity" class="block text-sm font-medium text-slate-700">
            Capacity
          </label>
          <input
            id="room-capacity"
            v-model.number="form.capacity"
            type="number"
            required
            min="1"
            max="1000"
            class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        <div>
          <label for="room-price" class="block text-sm font-medium text-slate-700">
            Price per hour (IDR)
          </label>
          <input
            id="room-price"
            v-model.number="form.pricePerHour"
            type="number"
            required
            min="0"
            step="1000"
            class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        <div>
          <label for="room-facilities" class="block text-sm font-medium text-slate-700">
            Facilities (comma separated)
          </label>
          <input
            id="room-facilities"
            v-model="form.facilities"
            type="text"
            placeholder="TV, Whiteboard, AC"
            class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
        </div>
      </div>

      <label class="flex items-center gap-2 text-sm text-slate-700">
        <input v-model="form.isActive" type="checkbox" class="h-4 w-4 rounded border-slate-300" />
        Active (visible to users)
      </label>

      <div class="flex flex-wrap gap-2">
        <button
          type="submit"
          :disabled="saving"
          class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ saving ? 'Saving...' : editingId ? 'Save changes' : 'Create room' }}
        </button>
        <button
          type="button"
          class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          @click="closeForm"
        >
          Cancel
        </button>
      </div>
    </form>

    <div v-if="loading" class="space-y-2">
      <div v-for="n in 3" :key="n" class="h-12 animate-pulse rounded-lg border border-slate-200 bg-white" />
    </div>

    <div v-else class="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table class="min-w-full divide-y divide-slate-200 text-sm">
        <thead class="bg-slate-50 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase">
          <tr>
            <th class="px-4 py-3">Room</th>
            <th class="px-4 py-3">Capacity</th>
            <th class="px-4 py-3">Price / hour</th>
            <th class="px-4 py-3">Facilities</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="room in rooms" :key="room.id">
            <td class="px-4 py-3 font-medium text-slate-900">{{ room.name }}</td>
            <td class="px-4 py-3 text-slate-600">{{ room.capacity }}</td>
            <td class="px-4 py-3 text-slate-600">{{ formatCurrency(room.pricePerHour) }}</td>
            <td class="px-4 py-3 text-slate-600">
              {{ room.facilities.length ? room.facilities.join(', ') : '—' }}
            </td>
            <td class="px-4 py-3">
              <span
                class="rounded-full px-2 py-0.5 text-xs font-semibold"
                :class="
                  room.isActive
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-200 text-slate-600'
                "
              >
                {{ room.isActive ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="px-4 py-3">
              <div class="flex justify-end gap-2">
                <button
                  type="button"
                  class="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                  @click="openEdit(room)"
                >
                  Edit
                </button>
                <button
                  type="button"
                  :disabled="busyId === room.id"
                  class="rounded-md border px-2.5 py-1 text-xs font-medium transition disabled:opacity-60"
                  :class="
                    room.isActive
                      ? 'border-red-300 text-red-700 hover:bg-red-50'
                      : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                  "
                  @click="toggleActive(room)"
                >
                  {{ room.isActive ? 'Deactivate' : 'Reactivate' }}
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="rooms.length === 0">
            <td colspan="6" class="px-4 py-10 text-center text-slate-500">
              No rooms yet. Create the first one.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
