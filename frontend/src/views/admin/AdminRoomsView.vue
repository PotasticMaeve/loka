<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import Button from 'openvue/button'
import Column from 'openvue/column'
import DataTable from 'openvue/datatable'
import Dialog from 'openvue/dialog'
import InputNumber from 'openvue/inputnumber'
import InputSwitch from 'openvue/inputswitch'
import InputText from 'openvue/inputtext'
import Message from 'openvue/message'
import { useConfirm } from 'openvue/useconfirm'
import { useToast } from 'openvue/usetoast'
import { api, getApiErrorMessage } from '@/lib/api'
import { formatCurrency } from '@/lib/format'
import type { Room } from '@/types/api'

const confirm = useConfirm()
const toast = useToast()

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
    const wasEditing = Boolean(editingId.value)
    closeForm()
    await loadRooms()
    toast.add({
      severity: 'success',
      summary: wasEditing ? 'Room updated' : 'Room created',
      detail: payload.name,
      life: 3000,
    })
  } catch (err) {
    error.value = getApiErrorMessage(err)
  } finally {
    saving.value = false
  }
}

function askToggleActive(room: Room) {
  if (!room.isActive) {
    void toggleActive(room)
    return
  }

  confirm.require({
    header: 'Deactivate this room?',
    message: `${room.name} will be hidden from the booking page. Existing bookings are not affected.`,
    acceptLabel: 'Deactivate',
    rejectLabel: 'Keep active',
    acceptClass: 'p-button-danger',
    accept: () => void toggleActive(room),
  })
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
      <p class="text-sm text-muted">{{ rooms.length }} room(s) total</p>
      <div class="flex gap-2">
        <Button label="Refresh" severity="secondary" outlined :loading="loading" @click="loadRooms" />
        <Button label="New room" @click="openCreate" />
      </div>
    </div>

    <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>

    <div class="surface overflow-hidden">
      <DataTable
        :value="rooms"
        data-key="id"
        :loading="loading"
        paginator
        :rows="10"
        striped-rows
        responsive-layout="scroll"
      >
        <template #empty>
          <p class="py-8 text-center text-sm text-muted">No rooms yet. Create the first one.</p>
        </template>

        <Column field="name" header="Room" sortable>
          <template #body="{ data }">
            <span class="font-medium text-ink">{{ data.name }}</span>
          </template>
        </Column>

        <Column field="capacity" header="Capacity" sortable>
          <template #body="{ data }">
            <span class="text-muted">{{ data.capacity }}</span>
          </template>
        </Column>

        <Column field="pricePerHour" header="Price / hour" sortable>
          <template #body="{ data }">
            <span class="text-muted">{{ formatCurrency(data.pricePerHour) }}</span>
          </template>
        </Column>

        <Column header="Facilities">
          <template #body="{ data }">
            <span class="text-muted">
              {{ data.facilities.length ? data.facilities.join(', ') : '—' }}
            </span>
          </template>
        </Column>

        <Column header="Status">
          <template #body="{ data }">
            <span
              class="inline-flex rounded-full px-2.5 py-1 text-xs font-bold"
              :class="data.isActive ? 'bg-violet-600 text-white' : 'border border-line bg-paper text-muted'"
            >
              {{ data.isActive ? 'Active' : 'Inactive' }}
            </span>
          </template>
        </Column>

        <Column header="">
          <template #body="{ data }">
            <div class="flex justify-end gap-2">
              <Button label="Edit" size="small" severity="secondary" outlined @click="openEdit(data)" />
              <Button
                :label="data.isActive ? 'Deactivate' : 'Reactivate'"
                size="small"
                :severity="data.isActive ? 'danger' : 'success'"
                outlined
                :loading="busyId === data.id"
                @click="askToggleActive(data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <Dialog
      v-model:visible="formOpen"
      :header="editingId ? 'Edit room' : 'New room'"
      modal
      :style="{ width: '34rem' }"
      :draggable="false"
    >
      <form class="space-y-4" @submit.prevent="save">
        <div>
          <label for="room-name" class="mb-1.5 block text-sm font-medium text-ink/80">Name</label>
          <InputText
            id="room-name"
            v-model="form.name"
            required
            minlength="2"
            maxlength="80"
            placeholder="Meeting Room A"
            class="w-full"
          />
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label for="room-capacity" class="mb-1.5 block text-sm font-medium text-ink/80">
              Capacity
            </label>
            <InputNumber
              id="room-capacity"
              v-model="form.capacity"
              :min="1"
              :max="1000"
              show-buttons
              class="w-full"
              input-class="w-full"
            />
          </div>

          <div>
            <label for="room-price" class="mb-1.5 block text-sm font-medium text-ink/80">
              Price / hour
            </label>
            <InputNumber
              id="room-price"
              v-model="form.pricePerHour"
              mode="currency"
              currency="IDR"
              locale="id-ID"
              :min="0"
              :step="10000"
              class="w-full"
              input-class="w-full"
            />
          </div>
        </div>

        <div>
          <label for="room-facilities" class="mb-1.5 block text-sm font-medium text-ink/80">
            Facilities
          </label>
          <InputText
            id="room-facilities"
            v-model="form.facilities"
            placeholder="TV, Whiteboard, AC"
            class="w-full"
          />
          <p class="mt-1.5 text-xs text-muted">Separate each facility with a comma.</p>
        </div>

        <label class="flex items-center gap-3 rounded-lg bg-paper px-3 py-2.5 text-sm text-ink/80">
          <InputSwitch v-model="form.isActive" />
          Active — visible to members
        </label>

        <div class="flex justify-end gap-2 pt-2">
          <Button type="button" label="Cancel" severity="secondary" text @click="closeForm" />
          <Button
            type="submit"
            :label="saving ? 'Saving…' : editingId ? 'Save changes' : 'Create room'"
            :loading="saving"
          />
        </div>
      </form>
    </Dialog>
  </div>
</template>
