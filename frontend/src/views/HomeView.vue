<script setup lang="ts">
import Button from 'openvue/button'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const steps = [
  {
    step: '01',
    title: 'Pick a room',
    description:
      'Compare capacity, hourly price, and facilities. Each card shows what is free today, so you pick with facts instead of guessing.',
    badge: 'bg-violet-600 text-white',
    timing: '~30 sec',
  },
  {
    step: '02',
    title: 'Choose the hours',
    description:
      'Tap the free hours on the grid. Touching hours chain into a single reservation, and taken hours are visibly locked.',
    badge: 'bg-violet-300 text-violet-950',
    timing: '~1 min',
  },
  {
    step: '03',
    title: 'Confirm',
    description:
      'Review the total, confirm once, and the slot is yours. It lands in My bookings immediately, cancellable up to 2h before.',
    badge: 'bg-violet-100 text-violet-900',
    timing: 'instant',
  },
]

const facts = [
  { label: 'Pricing', value: 'Per hour' },
  { label: 'Cancellation', value: 'Up to 2h before' },
]
</script>

<template>
  <div class="space-y-14">
    <section class="relative overflow-hidden bg-violet-950 rounded-[32px] px-6 py-12 text-white sm:px-10 sm:py-16">

      <div class="relative max-w-2xl">
        <p
          class="inline-flex items-center gap-2 rounded-full border border-white/25 px-3 py-1 font-mono text-[11px] font-medium tracking-[0.1em] text-white/80 uppercase"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-violet-300" />
          Hourly room booking
        </p>

        <h1 class="mt-5 font-display text-4xl leading-[0.98] font-extrabold tracking-[-0.035em] sm:text-6xl">
          Book the hours you need.
          <span class="text-violet-300">Not the whole day.</span>
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
              class="!border-white !bg-white !text-violet-950 hover:!bg-violet-50"
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

        <dl class="mt-10 grid max-w-sm grid-cols-2 gap-4 border-t border-white/15 pt-6">
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
        <span class="grid h-11 w-11 place-items-center rounded-2xl bg-violet-600 text-white">
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
      <div>
        <p class="eyebrow">How booking works</p>
        <h2 class="mt-3 font-display text-2xl font-extrabold tracking-tight text-ink">
          Three steps, about a minute.
        </h2>
      </div>

      <ol class="mt-6 grid gap-4 sm:grid-cols-3 sm:gap-6">
        <li
          v-for="(item, index) in steps"
          :key="item.step"
          class="reveal relative"
          :style="{ animationDelay: `${index * 110}ms` }"
        >
          <div
            class="surface group flex h-full flex-col p-6 transition duration-200 hover:-translate-y-1 hover:border-violet-300 hover:shadow-[0_2px_0_#e4def6,0_28px_52px_-30px_rgba(124,58,237,0.4)]"
          >
            <div class="flex items-center gap-3">
              <span
                class="grid h-11 w-11 shrink-0 place-items-center rounded-2xl font-display text-lg font-extrabold"
                :class="item.badge"
              >
                {{ item.step }}
              </span>
              <h3 class="text-base font-bold text-ink">{{ item.title }}</h3>
            </div>

            <p class="mt-3 flex-1 text-sm leading-relaxed text-muted">{{ item.description }}</p>

            <p class="mt-4 font-mono text-[11px] tracking-wide text-violet-700 uppercase">
              {{ item.timing }}
            </p>
          </div>

          <span
            v-if="index < steps.length - 1"
            class="arrow-nudge pointer-events-none absolute top-1/2 -right-[22px] z-10 hidden -translate-y-1/2 text-violet-400 sm:block"
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" class="h-5 w-5">
              <path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
        </li>
      </ol>

      <div class="mt-6 flex flex-wrap items-center gap-3">
        <RouterLink to="/rooms">
          <Button label="Start with step 1" />
        </RouterLink>
        <p class="text-sm text-muted">Pick a room and the rest is two taps.</p>
      </div>
    </section>
  </div>
</template>
