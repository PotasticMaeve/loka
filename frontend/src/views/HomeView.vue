<script setup lang="ts">
import Button from 'openvue/button'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const features = [
  {
    title: 'Live availability',
    description:
      'Every hour of the day shows exactly one state: free, taken, or already past. No guessing, no double bookings.',
    accent: 'bg-gradient-to-r from-blue-600 to-blue-400',
    ink: 'text-blue-600',
  },
  {
    title: 'Conflict-safe checkout',
    description:
      'Each reservation is validated inside a database transaction, so two people clicking at once cannot take the same slot.',
    accent: 'bg-gradient-to-r from-blue-600 to-blue-400',
    ink: 'text-ink',
  },
  {
    title: 'Admin in one place',
    description:
      'Rooms, opening hours, and every reservation are managed from a single dashboard.',
    accent: 'bg-ink',
    ink: 'text-ink',
  },
]

const steps = [
  {
    step: '01',
    title: 'Pick a room',
    description: 'Compare capacity, price per hour, and facilities.',
    dot: 'bg-blue-600 text-white',
  },
  {
    step: '02',
    title: 'Choose the hours',
    description: 'Select a contiguous block from the live slot grid.',
    dot: 'bg-blue-300 text-blue-950',
  },
  {
    step: '03',
    title: 'Confirm',
    description: 'The booking shows up in My bookings instantly.',
    dot: 'bg-blue-100 text-blue-900',
  },
]

const facts = [
  { label: 'Pricing', value: 'Per hour' },
  { label: 'Cancellation', value: 'Up to 2h before' },
  { label: 'Conflict', value: 'Never' },
]
</script>

<template>
  <div class="space-y-14">
    <section class="relative overflow-hidden gradient-deep rounded-[32px] px-6 py-12 text-white sm:px-10 sm:py-16">
      <div
        class="pointer-events-none absolute -top-24 right-0 h-80 w-80 rounded-full bg-blue-600/60 blur-3xl"
        aria-hidden="true"
      />
      <div
        class="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-blue-500/40 blur-3xl"
        aria-hidden="true"
      />

      <div class="relative max-w-2xl">
        <p
          class="inline-flex items-center gap-2 rounded-full border border-white/25 px-3 py-1 font-mono text-[11px] font-medium tracking-[0.1em] text-white/80 uppercase"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-blue-300" />
          Hourly room booking
        </p>

        <h1 class="mt-5 font-display text-4xl leading-[0.98] font-extrabold tracking-[-0.035em] sm:text-6xl">
          Book the hours you need.
          <span class="text-gradient">Not the whole day.</span>
        </h1>

        <p class="mt-5 max-w-xl text-base leading-relaxed text-white/75">
          Loka shows live hourly availability for every room, so you can reserve a two-hour
          slot without emailing anyone.
        </p>

        <div class="mt-8 flex flex-wrap items-center gap-3">
          <RouterLink to="/rooms">
            <Button
              label="Browse rooms"
              size="large"
              class="!border-white !bg-white !text-blue-950 hover:!bg-blue-50"
            />
          </RouterLink>

          <template v-if="auth.isAuthenticated">
            <RouterLink to="/bookings">
              <Button
                label="My bookings"
                size="large"
                class="!border-white/40 !bg-transparent !text-white hover:!bg-white/10"
                outlined
              />
            </RouterLink>
          </template>
          <template v-else>
            <RouterLink to="/register">
              <Button
                label="Create an account"
                size="large"
                class="!border-white/40 !bg-transparent !text-white hover:!bg-white/10"
                outlined
              />
            </RouterLink>
          </template>
        </div>

        <dl class="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-white/15 pt-6">
          <div v-for="fact in facts" :key="fact.label">
            <dt class="font-mono text-[10px] tracking-[0.1em] text-white/70 uppercase">
              {{ fact.label }}
            </dt>
            <dd class="mt-1 text-sm font-semibold text-white">{{ fact.value }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <section
      v-if="auth.isAuthenticated"
      class="surface flex flex-wrap items-center justify-between gap-4 p-6"
    >
      <div class="flex items-center gap-4">
        <span class="grid h-11 w-11 place-items-center rounded-2xl bg-blue-600 text-white">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" class="h-5 w-5">
            <path d="M8 2v4M16 2v4M3 10h18" stroke-linecap="round" />
            <rect x="3" y="4" width="18" height="18" rx="4" />
          </svg>
        </span>
        <div>
          <p class="text-sm font-semibold text-ink">Signed in as {{ auth.user?.name }}</p>
          <p class="font-mono text-xs text-muted">{{ auth.user?.email }}</p>
        </div>
      </div>
      <RouterLink to="/rooms">
        <Button label="Find a free slot" severity="secondary" outlined />
      </RouterLink>
    </section>

    <section>
      <p class="eyebrow">What makes it different</p>
      <div class="mt-5 grid gap-4 sm:grid-cols-3">
        <article
          v-for="feature in features"
          :key="feature.title"
          class="surface group relative overflow-hidden p-6 transition hover:-translate-y-1 hover:shadow-[0_2px_0_#e0dacb,0_28px_52px_-30px_rgba(43,31,224,0.3)]"
        >
          <span class="mb-4 block h-2 w-10 rounded-full" :class="feature.accent" />
          <h3 class="text-lg font-bold text-ink">{{ feature.title }}</h3>
          <p class="mt-2 text-sm leading-relaxed text-muted">{{ feature.description }}</p>
        </article>
      </div>
    </section>

    <section>
      <p class="eyebrow">How it works</p>
      <ol class="mt-5 grid gap-4 sm:grid-cols-3">
        <li v-for="item in steps" :key="item.step" class="surface p-6">
          <span
            class="grid h-9 w-9 place-items-center rounded-full font-mono text-xs font-semibold"
            :class="item.dot"
          >
            {{ item.step }}
          </span>
          <h3 class="mt-4 text-base font-bold text-ink">{{ item.title }}</h3>
          <p class="mt-1.5 text-sm leading-relaxed text-muted">{{ item.description }}</p>
        </li>
      </ol>
    </section>
  </div>
</template>
