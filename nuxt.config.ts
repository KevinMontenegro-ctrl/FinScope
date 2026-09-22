// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: true },
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  // ... resto de tu configuración
})