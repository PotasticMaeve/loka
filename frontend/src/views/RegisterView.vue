<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getApiErrorMessage } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const form = reactive({ name: '', email: '', password: '' })
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true

  try {
    await auth.register(form.name, form.email, form.password)
    await router.push('/')
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
      <h1 class="text-2xl font-bold">Create your account</h1>
      <p class="mt-1 text-sm text-slate-600">Sign up to start booking rooms.</p>

      <form class="mt-6 space-y-4" @submit.prevent="submit">
        <div>
          <label for="name" class="block text-sm font-medium text-slate-700">Name</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            autocomplete="name"
            required
            minlength="2"
            class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
        </div>

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
            autocomplete="new-password"
            required
            minlength="8"
            class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
          <p class="mt-1 text-xs text-slate-500">At least 8 characters.</p>
        </div>

        <p v-if="error" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {{ error }}
        </p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ loading ? 'Creating account...' : 'Create account' }}
        </button>
      </form>

      <p class="mt-4 text-center text-sm text-slate-600">
        Already have an account?
        <RouterLink to="/login" class="font-semibold text-indigo-600 hover:text-indigo-700">
          Log in
        </RouterLink>
      </p>
    </div>
  </div>
</template>
