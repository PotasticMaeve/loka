<script setup lang="ts">
const tabs = [
  { name: 'admin-rooms', label: 'Rooms' },
  { name: 'admin-bookings', label: 'Bookings' },
  { name: 'admin-settings', label: 'Settings' },
]
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="text-2xl font-bold">Admin dashboard</h1>
      <p class="mt-1 text-sm text-slate-600">Manage rooms, reservations, and operating hours.</p>
    </header>

    <nav class="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
      <RouterLink
        v-for="tab in tabs"
        :key="tab.name"
        :to="{ name: tab.name }"
        class="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 transition"
        active-class="bg-indigo-600 text-white"
      >
        {{ tab.label }}
      </RouterLink>
    </nav>

    <RouterView />
  </div>
</template>
