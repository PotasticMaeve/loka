<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Button from 'openvue/button'
import Column from 'openvue/column'
import DataTable from 'openvue/datatable'
import Message from 'openvue/message'
import Select from 'openvue/select'
import SelectButton from 'openvue/selectbutton'
import { useToast } from 'openvue/usetoast'
import StatusBadge from '@/components/StatusBadge.vue'
import { api, getApiErrorMessage } from '@/lib/api'
import { formatCurrency, formatInZone } from '@/lib/format'
import type { Booking, BookingStatus, Settings } from '@/types/api'

type Filter = BookingStatus | 'ALL'

const filters: Array<{ label: string; value: Filter }> = [
  { label: 'All', value: 'ALL' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
]

const toast = useToast()

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
    toast.add({
      severity: status === 'COMPLETED' ? 'success' : 'info',
      summary: status === 'COMPLETED' ? 'Booking completed' : 'Booking cancelled',
      detail: booking.room.name,
      life: 3000,
    })
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
      <div class="w-full sm:w-auto">
        <Select
          v-model="filter"
          :options="filters"
          option-label="label"
          option-value="value"
          class="w-full sm:hidden"
          @change="changeFilter(filter)"
        />
        <div class="hidden sm:block">
          <SelectButton
            v-model="filter"
            :options="filters"
            option-label="label"
            option-value="value"
            :allow-empty="false"
            @change="changeFilter(filter)"
          />
        </div>
      </div>

      <Button
        label="Refresh"
        severity="secondary"
        outlined
        :loading="loading"
        @click="loadBookings"
      />
    </div>

    <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>

    <div class="surface overflow-hidden">
      <DataTable
        :value="bookings"
        data-key="id"
        :loading="loading"
        paginator
        :rows="10"
        striped-rows
        responsive-layout="scroll"
      >
        <template #empty>
          <p class="py-8 text-center text-sm text-muted">No bookings match this filter.</p>
        </template>

        <Column header="Member" sortable field="user.name">
          <template #body="{ data }">
            <p class="font-medium text-ink">{{ data.user?.name ?? '—' }}</p>
            <p class="text-xs text-muted">{{ data.user?.email ?? '' }}</p>
          </template>
        </Column>

        <Column header="Room" sortable field="room.name">
          <template #body="{ data }">
            <span class="text-muted">{{ data.room.name }}</span>
          </template>
        </Column>

        <Column header="Time" sortable field="startTime">
          <template #body="{ data }">
            <p class="text-ink/80">{{ formatInZone(data.startTime, timezone) }}</p>
            <p class="text-xs text-muted">until {{ formatInZone(data.endTime, timezone) }}</p>
          </template>
        </Column>

        <Column header="Total" sortable field="totalPrice">
          <template #body="{ data }">
            <span class="font-medium text-ink">{{ formatCurrency(data.totalPrice) }}</span>
          </template>
        </Column>

        <Column header="Status">
          <template #body="{ data }">
            <StatusBadge :status="data.status" />
          </template>
        </Column>

        <Column header="">
          <template #body="{ data }">
            <div v-if="data.status === 'CONFIRMED'" class="flex justify-end gap-2">
              <Button
                label="Complete"
                size="small"
                severity="success"
                outlined
                :loading="busyId === data.id"
                @click="updateStatus(data, 'COMPLETED')"
              />
              <Button
                label="Cancel"
                size="small"
                severity="danger"
                outlined
                :loading="busyId === data.id"
                @click="updateStatus(data, 'CANCELLED')"
              />
            </div>
            <p v-else class="text-right text-xs text-slate-400">—</p>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>
