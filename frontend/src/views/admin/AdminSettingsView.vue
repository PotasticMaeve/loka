<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import Button from 'openvue/button'
import Card from 'openvue/card'
import Message from 'openvue/message'
import Select from 'openvue/select'
import Skeleton from 'openvue/skeleton'
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

function hourLabel(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`
}

const openHours = Array.from({ length: 24 }, (_, hour) => ({
  label: hourLabel(hour),
  value: hour,
}))
const closeHours = Array.from({ length: 24 }, (_, hour) => ({
  label: hourLabel(hour + 1),
  value: hour + 1,
}))

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
    <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
    <Message v-if="success" severity="success" :closable="false">{{ success }}</Message>

    <Card v-if="loading">
      <template #content>
        <Skeleton height="1.5rem" width="40%" />
        <Skeleton height="3rem" class="mt-5" />
        <Skeleton height="2.5rem" width="30%" class="mt-5" />
      </template>
    </Card>

    <Card v-else class="max-w-2xl">
      <template #content>
        <form class="space-y-5" @submit.prevent="save">
          <div>
            <h2 class="text-lg font-semibold tracking-tight text-ink">Operating hours</h2>
            <p class="mt-1 text-sm leading-relaxed text-muted">
              Booking slots are generated between these hours, using the timezone below.
            </p>
          </div>

          <div class="grid gap-4 sm:grid-cols-3">
            <div>
              <label for="open-hour" class="mb-1.5 block text-sm font-medium text-ink/80">
                Opens at
              </label>
              <Select
                v-model="form.openHour"
                input-id="open-hour"
                :options="openHours"
                option-label="label"
                option-value="value"
                class="w-full"
              />
            </div>

            <div>
              <label for="close-hour" class="mb-1.5 block text-sm font-medium text-ink/80">
                Closes at
              </label>
              <Select
                v-model="form.closeHour"
                input-id="close-hour"
                :options="closeHours"
                option-label="label"
                option-value="value"
                class="w-full"
              />
            </div>

            <div>
              <label for="timezone" class="mb-1.5 block text-sm font-medium text-ink/80">
                Timezone
              </label>
              <Select
                v-model="form.timezone"
                input-id="timezone"
                :options="commonTimezones"
                editable
                placeholder="Asia/Jakarta"
                class="w-full"
              />
            </div>
          </div>

          <p class="rounded-xl border border-line bg-blue-50 px-4 py-3 text-xs leading-relaxed text-blue-900">
            Closing time must be later than opening time. Use an IANA timezone name such as
            <code class="font-mono">Asia/Jakarta</code>.
          </p>

          <Button
            type="submit"
            :label="saving ? 'Saving…' : 'Save settings'"
            :loading="saving"
          />
        </form>
      </template>
    </Card>
  </div>
</template>
