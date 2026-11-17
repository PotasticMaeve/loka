<script setup lang="ts">
import type { BookingStatus } from '@/types/api'

defineProps<{ status: BookingStatus }>()

// One hue (blue) with three weights: solid = active, tinted = done, ink = void.
// Shape and text carry meaning; color only reinforces it.
const classes: Record<BookingStatus, string> = {
  CONFIRMED: 'bg-blue-600 text-white',
  CANCELLED: 'bg-ink text-white',
  COMPLETED: 'bg-blue-100 text-blue-900',
}

const labels: Record<BookingStatus, string> = {
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
}
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap"
    :class="classes[status]"
  >
    {{ labels[status] }}
  </span>
</template>
