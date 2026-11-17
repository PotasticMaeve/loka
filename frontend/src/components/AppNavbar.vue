<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

function logout() {
  auth.logout()
  void router.push({ name: 'login' })
}
</script>

<template>
  <header class="border-b border-slate-200 bg-white">
    <div class="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
      <RouterLink to="/" class="text-xl font-bold tracking-tight text-indigo-600">
        Loka
      </RouterLink>

      <nav class="flex items-center gap-4 text-sm">
        <template v-if="auth.isAuthenticated">
          <span class="hidden text-slate-600 sm:inline">
            {{ auth.user?.name ?? 'Account' }}
            <span
              v-if="auth.isAdmin"
              class="ml-1 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700"
            >
              Admin
            </span>
          </span>
          <button
            type="button"
            class="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-700 transition hover:bg-slate-100"
            @click="logout"
          >
            Log out
          </button>
        </template>

        <template v-else>
          <RouterLink
            to="/login"
            class="font-medium text-slate-600 transition hover:text-slate-900"
          >
            Log in
          </RouterLink>
          <RouterLink
            to="/register"
            class="rounded-md bg-indigo-600 px-3 py-1.5 font-semibold text-white transition hover:bg-indigo-700"
          >
            Register
          </RouterLink>
        </template>
      </nav>
    </div>
  </header>
</template>
