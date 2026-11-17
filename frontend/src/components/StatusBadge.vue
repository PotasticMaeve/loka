<script setup lang="ts">
import type { BookingStatus } from '@/types/api'

defineProps<{ status: BookingStatus }>()

const styles: Record<BookingStatus, string> = {
  CONFIRMED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-slate-200 text-slate-700',
}

const labels: Record<BookingStatus, string> = {
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
}
</script>

<template>
  <span class="rounded-full px-2 py-0.5 text-xs font-semibold" :class="styles[status]">
    {{ labels[status] }}
  </span>
</template>
