<script setup lang="ts">
import { onMounted } from 'vue'
import AppNavbar from '@/components/AppNavbar.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

// Refresh the profile on reload; also validates a stored token.
onMounted(() => {
  if (auth.isAuthenticated) {
    void auth.fetchMe()
  }
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <AppNavbar />
    <main class="mx-auto w-full max-w-5xl px-4 py-8">
      <RouterView />
    </main>
  </div>
</template>
