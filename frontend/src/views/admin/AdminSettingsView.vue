<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { api, getApiErrorMessage } from '@/lib/api'
import type { Settings } from '@/types/api'

const commonTimezones = [
  'Asia/Jakarta',
  'Asia/Makassar',
  'Asia/Jayapura',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Europe/London',
  'America/New_York',
  'UTC',
]

const openHours = Array.from({ length: 24 }, (_, hour) => hour)
const closeHours = Array.from({ length: 24 }, (_, hour) => hour + 1)

const loading = ref(true)
const saving = ref(false)
const error = ref('')
const success = ref('')

const form = reactive({
  openHour: 9,
  closeHour: 21,
  timezone: 'Asia/Jakarta',
})

async function loadSettings() {
  loading.value = true
  error.value = ''

  try {
    const { data } = await api.get<{ settings: Settings }>('/settings')
    form.openHour = data.settings.openHour
    form.closeHour = data.settings.closeHour
    form.timezone = data.settings.timezone
  } catch (err) {
    error.value = getApiErrorMessage(err)
  } finally {
    loading.value = false
  }
}

async function save() {
  saving.value = true
  error.value = ''
  success.value = ''

  try {
    const { data } = await api.put<{ settings: Settings }>('/settings', {
      openHour: Number(form.openHour),
      closeHour: Number(form.closeHour),
      timezone: form.timezone.trim(),
    })
    form.openHour = data.settings.openHour
    form.closeHour = data.settings.closeHour
    form.timezone = data.settings.timezone
    success.value = 'Operating hours updated.'
  } catch (err) {
    error.value = getApiErrorMessage(err)
  } finally {
    saving.value = false
  }
}

onMounted(loadSettings)
</script>

<template>
  <div class="space-y-5">
    <p v-if="error" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{{ error }}</p>
    <p v-if="success" class="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
      {{ success }}
    </p>

    <div v-if="loading" class="h-56 animate-pulse rounded-xl border border-slate-200 bg-white" />

    <form
      v-else
      class="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      @submit.prevent="save"
    >
      <div>
        <h2 class="text-lg font-semibold">Operating hours</h2>
        <p class="mt-1 text-sm text-slate-600">
          Booking slots are generated between these hours, using the timezone below.
        </p>
      </div>

      <div class="grid gap-4 sm:grid-cols-3">
        <div>
          <label for="open-hour" class="block text-sm font-medium text-slate-700">Opens at</label>
          <select
            id="open-hour"
            v-model.number="form.openHour"
            class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          >
            <option v-for="hour in openHours" :key="hour" :value="hour">
              {{ String(hour).padStart(2, '0') }}:00
            </option>
          </select>
        </div>

        <div>
          <label for="close-hour" class="block text-sm font-medium text-slate-700">Closes at</label>
          <select
            id="close-hour"
            v-model.number="form.closeHour"
            class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          >
            <option v-for="hour in closeHours" :key="hour" :value="hour">
              {{ String(hour).padStart(2, '0') }}:00
            </option>
          </select>
        </div>

        <div>
          <label for="timezone" class="block text-sm font-medium text-slate-700">Timezone</label>
          <input
            id="timezone"
            v-model="form.timezone"
            type="text"
            required
            list="timezone-options"
            class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
          <datalist id="timezone-options">
            <option v-for="zone in commonTimezones" :key="zone" :value="zone" />
          </datalist>
        </div>
      </div>

      <p class="rounded-lg bg-amber-50 px-4 py-3 text-xs text-amber-800">
        Closing time must be later than opening time. Use an IANA timezone name such as
        <code class="font-mono">Asia/Jakarta</code>.
      </p>

      <button
        type="submit"
        :disabled="saving"
        class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {{ saving ? 'Saving...' : 'Save settings' }}
      </button>
    </form>
  </div>
</template>
