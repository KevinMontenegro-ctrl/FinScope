<script setup lang="ts">
// Redirige al login si no hay usuario (el middleware también lo hace, pero esto es por seguridad)
import { auth } from '~/database'

onMounted(async () => {
  const usuario = await auth.usuarioActual()
  if (!usuario) {
    await navigateTo('/login')
  }
})
</script>

<template>
  <div style="min-height:100vh;display:grid;place-items:center;background:#0d0618;color:#fff;font-family:system-ui">
    <div style="text-align:center">
      <h1>📊 FinScope Dashboard</h1>
      <p style="color:#a78bfa">Bienvenido a tu panel de finanzas</p>
      <NuxtLink to="/login" style="color:#d8b4fe">Ir al Login</NuxtLink>
    </div>
  </div>
</template>