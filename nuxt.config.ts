// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  // Modo SPA: toda la app corre en el cliente (necesario para Dexie/IndexedDB)
  ssr: false,

  // Devtools activas solo en desarrollo
  devtools: { enabled: true },

  // Configuración del servidor para Codespaces
  devServer: {
    host: '0.0.0.0',
    port: 3000,
  },

  // Metadatos del head
  app: {
    head: {
      title: 'FinScope - Finanzas Personales',
      htmlAttrs: { lang: 'es' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Gestiona tus finanzas personales de forma local y segura.' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },

  // Vite: asegura que Dexie se cargue correctamente en cliente
  vite: {
    optimizeDeps: {
      include: ['dexie'],
    },
  },

  // Evita problemas de resolución de rutas en Codespaces
  nitro: {
    preset: 'static',
  },
})