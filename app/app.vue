<script setup lang="ts">
import { auth, type Usuario } from '~/database'

const usuario = useState<Usuario | null>('usuario', () => null)
const route = useRoute()
const listo = ref(false)

const rutasPublicas = ['/login', '/registro']

onMounted(async () => {
  const u = await auth.usuarioActual()
  usuario.value = u

  if (!u && !rutasPublicas.includes(route.path)) {
    await navigateTo('/login')
  }

  listo.value = true
})
</script>

<template>
  <template v-if="listo">
    <!-- 👇 ESTO ES LO QUE FALTA SI VES LA PÁGINA SIN HEADER -->
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </template>
</template>