<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const features = [
  {
    title: 'Live availability',
    description: 'Hourly slots show exactly what is free, booked, or already past.',
  },
  {
    title: 'Conflict-safe booking',
    description: 'Every reservation is checked inside a database transaction.',
  },
  {
    title: 'Admin controls',
    description: 'Manage rooms, opening hours, and every reservation in one place.',
  },
]
</script>

<template>
  <div class="space-y-8">
    <section
      class="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 px-6 py-10 text-white shadow-lg sm:px-10"
    >
      <p class="text-sm font-semibold tracking-widest text-indigo-100 uppercase">Loka</p>
      <h1 class="mt-2 text-3xl font-bold sm:text-4xl">Book your space, hour by hour.</h1>
      <p class="mt-3 max-w-2xl text-indigo-100">
        Browse rooms, see live availability, and reserve the exact hours you need. No double
        bookings, no back-and-forth messages.
      </p>

      <div class="mt-6 flex flex-wrap items-center gap-3">
        <template v-if="auth.isAuthenticated">
          <span class="rounded-lg bg-white/10 px-4 py-2 text-sm">
            Signed in as <strong>{{ auth.user?.name }}</strong>
          </span>
        </template>
        <template v-else>
          <RouterLink
            to="/register"
            class="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
          >
            Create an account
          </RouterLink>
          <RouterLink
            to="/login"
            class="rounded-lg border border-white/40 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Log in
          </RouterLink>
        </template>
      </div>
    </section>

    <section
      v-if="auth.isAuthenticated"
      class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 class="text-lg font-semibold">Your account</h2>
      <dl class="mt-4 grid gap-4 text-sm sm:grid-cols-3">
        <div>
          <dt class="font-medium text-slate-500">Name</dt>
          <dd class="mt-1 text-slate-900">{{ auth.user?.name }}</dd>
        </div>
        <div>
          <dt class="font-medium text-slate-500">Email</dt>
          <dd class="mt-1 text-slate-900">{{ auth.user?.email }}</dd>
        </div>
        <div>
          <dt class="font-medium text-slate-500">Role</dt>
          <dd class="mt-1 text-slate-900">{{ auth.user?.role }}</dd>
        </div>
      </dl>
      <p class="mt-5 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Room browsing and booking arrive in the next step.
      </p>
    </section>

    <section class="grid gap-4 sm:grid-cols-3">
      <article
        v-for="feature in features"
        :key="feature.title"
        class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h3 class="font-semibold text-slate-900">{{ feature.title }}</h3>
        <p class="mt-2 text-sm text-slate-600">{{ feature.description }}</p>
      </article>
    </section>
  </div>
</template>
