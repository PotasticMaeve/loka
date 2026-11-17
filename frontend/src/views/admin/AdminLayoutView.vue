<script setup lang="ts">
const tabs = [
  { name: 'admin-rooms', label: 'Rooms' },
  { name: 'admin-bookings', label: 'Bookings' },
  { name: 'admin-settings', label: 'Settings' },
]
</script>

<template>
  <div class="space-y-8">
    <header>
      <p class="eyebrow">Administration</p>
      <h1 class="page-title mt-3">Admin dashboard</h1>
      <p class="page-subtitle">Manage rooms, reservations, and operating hours.</p>
    </header>

    <nav class="inline-flex flex-wrap gap-1 rounded-full border border-line bg-white p-1">
      <RouterLink
        v-for="tab in tabs"
        :key="tab.name"
        :to="{ name: tab.name }"
        class="rounded-full px-4 py-1.5 text-sm font-semibold text-muted transition hover:text-ink"
        active-class="bg-ink text-white hover:text-white"
      >
        {{ tab.label }}
      </RouterLink>
    </nav>

    <RouterView />
  </div>
</template>
