<script setup lang="ts">
import { auth, type Usuario } from '~/database'

const usuario = useState<Usuario | null>('usuario', () => null)
const route = useRoute()
const listo = ref(false)

onMounted(async () => {
  // 1. Limpiar cualquier sesión guardada en IndexedDB
  //    → Esto fuerza que cada arranque pida login
  await auth.cerrarSesion()
  usuario.value = null

  // 2. Redirigir a /login si no está ya en una ruta pública
  const rutasPublicas = ['/login', '/registro']
  if (!rutasPublicas.includes(route.path)) {
    await navigateTo('/login')
  }

  // 3. Mostrar la app
  listo.value = true
})
</script>

<template>
  <template v-if="listo">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </template>
</template>