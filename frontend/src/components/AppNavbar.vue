<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import Avatar from 'openvue/avatar'
import Button from 'openvue/button'
import Menu from 'openvue/menu'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const accountMenu = ref<{ toggle: (event: Event) => void } | null>(null)

const initials = computed(() =>
  (auth.user?.name ?? '?')
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase(),
)

const navLinks = computed(() => {
  const links = [{ to: '/rooms', label: 'Rooms' }]
  if (auth.isAuthenticated) {
    links.push({ to: '/bookings', label: 'My bookings' })
  }
  if (auth.isAdmin) {
    links.push({ to: '/admin', label: 'Admin' })
  }
  return links
})

const accountItems = computed(() => [
  {
    label: 'My bookings',
    command: () => void router.push({ name: 'my-bookings' }),
  },
  ...(auth.isAdmin
    ? [
        {
          label: 'Admin dashboard',
          command: () => void router.push({ name: 'admin-rooms' }),
        },
      ]
    : []),
  { separator: true },
  {
    label: 'Log out',
    command: logout,
  },
])

function toggleAccount(event: Event) {
  accountMenu.value?.toggle(event)
}

function logout() {
  auth.logout()
  void router.push({ name: 'login' })
}
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md">
    <div class="mx-auto flex w-full max-w-6xl items-center gap-5 px-4 py-3 sm:px-6">
      <RouterLink to="/" class="group flex items-center gap-2.5">
        <span
          class="grid h-10 w-10 place-items-center rounded-2xl bg-blue-600 font-display text-lg font-extrabold text-white transition group-hover:rotate-[-6deg]"
        >
          L
        </span>
        <span class="font-display text-xl font-extrabold tracking-tight text-ink">Loka</span>
      </RouterLink>

      <nav class="hidden items-center gap-1 md:flex">
        <RouterLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="rounded-full px-3.5 py-1.5 text-sm font-semibold text-muted transition hover:bg-white hover:text-ink"
          active-class="bg-ink text-white hover:bg-ink hover:text-white"
        >
          {{ link.label }}
        </RouterLink>
      </nav>

      <div class="ml-auto flex items-center gap-2">
        <template v-if="auth.isAuthenticated">
          <button
            type="button"
            class="flex items-center gap-2.5 rounded-full border border-line bg-white py-1 pr-3.5 pl-1 transition hover:border-ink/30"
            aria-haspopup="true"
            @click="toggleAccount"
          >
            <Avatar
              :label="initials"
              shape="circle"
              size="normal"
              class="!bg-blue-600 !font-semibold !text-white"
            />
            <span class="hidden text-left sm:block">
              <span class="block text-sm font-semibold leading-tight text-ink">
                {{ auth.user?.name }}
              </span>
              <span class="block font-mono text-[10px] leading-tight text-muted uppercase">
                {{ auth.isAdmin ? 'Administrator' : 'Member' }}
              </span>
            </span>
          </button>
          <Menu ref="accountMenu" :model="accountItems" popup />
        </template>

        <template v-else>
          <RouterLink to="/login">
            <Button label="Log in" severity="secondary" text />
          </RouterLink>
          <RouterLink to="/register">
            <Button label="Get started" />
          </RouterLink>
        </template>
      </div>
    </div>
  </header>
</template>
