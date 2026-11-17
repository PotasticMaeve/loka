<script setup lang="ts">
import { onMounted } from 'vue'
import ConfirmDialog from 'openvue/confirmdialog'
import Toast from 'openvue/toast'
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
  <div class="flex min-h-screen flex-col bg-paper">
    <AppNavbar />

    <main class="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:py-12">
      <RouterView />
    </main>

    <footer class="mt-8 border-t border-line">
      <div
        class="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-4 py-5 font-mono text-[11px] tracking-wide text-muted uppercase sm:px-6"
      >
        <p>Loka Booking</p>
        <p>Copyright @ 2026</p>
      </div>
    </footer>

    <Toast position="top-right" />
    <ConfirmDialog />
  </div>
</template>
