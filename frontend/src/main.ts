import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ConfirmationService from 'openvue/confirmationservice'
import PrimeVue from 'openvue/config'
import ToastService from 'openvue/toastservice'
import './style.css'
import App from './App.vue'
import router from './router'
import { LokaPreset } from '@/theme/loka-preset'

const app = createApp(App)

app.use(createPinia())

app.use(PrimeVue, {
  ripple: true,
  theme: {
    preset: LokaPreset,
    options: {
      darkModeSelector: '.dark',
      // Wraps library styles in the `primevue` cascade layer so app-level
      // Tailwind utilities can override them. The `order` string must be
      // emitted by the library itself (it injects it before any bundled CSS),
      // otherwise `@layer primevue` is registered first and Tailwind's
      // preflight resets every component.
      cssLayer: { name: 'primevue', order: 'theme, base, primevue' },
    },
  },
})

app.use(ToastService)
app.use(ConfirmationService)
app.use(router)

app.mount('#app')
