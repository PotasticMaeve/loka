<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getApiErrorMessage } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const form = reactive({ email: '', password: '' })
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true

  try {
    await auth.login(form.email, form.password)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    await router.push(redirect)
  } catch (err) {
    error.value = getApiErrorMessage(err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-md">
    <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h1 class="text-2xl font-bold">Welcome back</h1>
      <p class="mt-1 text-sm text-slate-600">Log in to manage your reservations.</p>

      <form class="mt-6 space-y-4" @submit.prevent="submit">
        <div>
          <label for="email" class="block text-sm font-medium text-slate-700">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            autocomplete="email"
            required
            class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-slate-700">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            autocomplete="current-password"
            required
            class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        <p v-if="error" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {{ error }}
        </p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ loading ? 'Logging in...' : 'Log in' }}
        </button>
      </form>

      <p class="mt-4 text-center text-sm text-slate-600">
        No account yet?
        <RouterLink to="/register" class="font-semibold text-indigo-600 hover:text-indigo-700">
          Register
        </RouterLink>
      </p>
    </div>
  </div>
</template>
