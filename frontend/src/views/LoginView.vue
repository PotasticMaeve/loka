<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'openvue/button'
import InputText from 'openvue/inputtext'
import Message from 'openvue/message'
import Password from 'openvue/password'
import { getApiErrorMessage } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const form = reactive({ email: '', password: '' })
const error = ref('')
const loading = ref(false)

const highlights = [
  'Live hourly availability',
  'Instant confirmation',
  'Cancel up to 2 hours before',
]

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
  <div class="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_1fr] lg:items-stretch">
    <section class="surface-dark relative overflow-hidden p-8 sm:p-10">
      <div
        class="pointer-events-none absolute -top-20 -right-16 h-64 w-64 rounded-full bg-blue-600/60 blur-3xl"
        aria-hidden="true"
      />
      <div class="relative">
        <p class="font-mono text-[11px] tracking-[0.1em] text-white/70 uppercase">Welcome back</p>
        <h1 class="mt-3 font-display text-3xl leading-tight font-extrabold tracking-tight text-white">
          Your rooms are
          <span class="text-blue-200">one click</span> away.
        </h1>
        <p class="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
          Log in to see live hourly availability, manage your reservations, and cancel without
          emailing anyone.
        </p>

        <ul class="mt-8 space-y-3">
          <li
            v-for="item in highlights"
            :key="item"
            class="flex items-center gap-3 text-sm font-medium text-white/85"
          >
            <span class="grid h-6 w-6 place-items-center rounded-full bg-white text-blue-900">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" class="h-3.5 w-3.5">
                <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
            {{ item }}
          </li>
        </ul>
      </div>
    </section>

    <section class="surface p-6 sm:p-8">
      <h2 class="font-display text-2xl font-extrabold tracking-tight text-ink">Log in</h2>
      <p class="mt-1 text-sm text-muted">Manage your reservations.</p>

      <form class="mt-6 space-y-5" @submit.prevent="submit">
        <div>
          <label for="email" class="mb-1.5 block text-sm font-semibold text-ink">Email</label>
          <InputText
            id="email"
            v-model="form.email"
            type="email"
            autocomplete="email"
            placeholder="you@example.com"
            required
            class="w-full"
          />
        </div>

        <div>
          <label for="password" class="mb-1.5 block text-sm font-semibold text-ink">Password</label>
          <Password
            v-model="form.password"
            input-id="password"
            :feedback="false"
            toggle-mask
            autocomplete="current-password"
            placeholder="••••••••"
            required
            class="w-full"
            :input-style="{ width: '100%' }"
          />
        </div>

        <Message v-if="error" severity="error" :closable="false" size="small">{{ error }}</Message>

        <Button
          type="submit"
          :label="loading ? 'Logging in…' : 'Log in'"
          :loading="loading"
          class="w-full"
        />
      </form>

      <p class="mt-6 text-center text-sm text-muted">
        No account yet?
        <RouterLink to="/register" class="font-bold text-blue-600 hover:text-blue-700">
          Create one
        </RouterLink>
      </p>
    </section>
  </div>
</template>
