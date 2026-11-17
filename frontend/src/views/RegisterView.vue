<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'openvue/button'
import InputText from 'openvue/inputtext'
import Message from 'openvue/message'
import Password from 'openvue/password'
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
  <div class="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_1fr] lg:items-stretch">
    <section class="surface-dark relative overflow-hidden p-8 sm:p-10">
      <div class="relative">
        <p class="font-mono text-[11px] tracking-[0.1em] text-white/70 uppercase">Get started</p>
        <h1 class="mt-3 font-display text-3xl leading-tight font-extrabold tracking-tight text-white">
          Reserve a room in
          <span class="text-violet-200">under a minute.</span>
        </h1>
        <p class="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
          Create an account to book hourly slots, see your reservation history, and cancel when
          plans change.
        </p>

        <dl class="mt-8 grid grid-cols-2 gap-3">
          <div class="rounded-2xl border border-white/15 bg-white/5 p-4">
            <dt class="font-mono text-[10px] tracking-[0.1em] text-white/70 uppercase">Billing</dt>
            <dd class="mt-1 text-sm font-semibold text-white">Pay per hour used</dd>
          </div>
          <div class="rounded-2xl border border-white/15 bg-white/5 p-4">
            <dt class="font-mono text-[10px] tracking-[0.1em] text-white/70 uppercase">
              Confirmation
            </dt>
            <dd class="mt-1 text-sm font-semibold text-white">Instant</dd>
          </div>
        </dl>
      </div>
    </section>

    <section class="surface p-6 sm:p-8">
      <h2 class="font-display text-2xl font-extrabold tracking-tight text-ink">
        Create your account
      </h2>
      <p class="mt-1 text-sm text-muted">Sign up to start booking rooms.</p>

      <form class="mt-6 space-y-5" @submit.prevent="submit">
        <div>
          <label for="name" class="mb-1.5 block text-sm font-semibold text-ink">Name</label>
          <InputText
            id="name"
            v-model="form.name"
            type="text"
            autocomplete="name"
            placeholder="Your full name"
            required
            minlength="2"
            class="w-full"
          />
        </div>

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
            toggle-mask
            autocomplete="new-password"
            placeholder="At least 8 characters"
            required
            minlength="8"
            class="w-full"
            :input-style="{ width: '100%' }"
          />
          <p class="mt-1.5 text-xs text-muted">At least 8 characters.</p>
        </div>

        <Message v-if="error" severity="error" :closable="false" size="small">{{ error }}</Message>

        <Button
          type="submit"
          :label="loading ? 'Creating account…' : 'Create account'"
          :loading="loading"
          class="w-full"
        />
      </form>

      <p class="mt-6 text-center text-sm text-muted">
        Already have an account?
        <RouterLink to="/login" class="font-bold text-violet-600 hover:text-violet-700">
          Log in
        </RouterLink>
      </p>
    </section>
  </div>
</template>
