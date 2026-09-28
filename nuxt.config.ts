export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: false,
  devtools: { enabled: false },

  devServer: {
    host: '0.0.0.0',
    port: 3000,
  },

  // ============ MÓDULO SUPABASE ============
  modules: ['@nuxtjs/supabase'],

  supabase: {
    // Lee SUPABASE_URL y SUPABASE_KEY del .env automáticamente
    redirect: true,
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/registro'],
    },
  },

  // ============ CSS GLOBAL ============
  css: ['~/assets/css/main.css'],

  // ============ HEAD ============
  app: {
    head: {
      title: 'FinScope · Finanzas Personales',
      htmlAttrs: { lang: 'es' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Gestiona tus finanzas personales.' },
        { name: 'theme-color', content: '#fafafa' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },
})