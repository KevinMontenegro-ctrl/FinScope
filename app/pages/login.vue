<script setup lang="ts">
import { auth } from '~/database'

const usuario = useState<any>('usuario')
const email = ref('')
const password = ref('')
const error = ref('')
const cargando = ref(false)

const entrar = async () => {
  error.value = ''
  cargando.value = true
  try {
    const u = await auth.login(email.value, password.value)
    usuario.value = u
    await navigateTo('/')
  } catch (e: any) {
    error.value = e.message ?? 'Error al iniciar sesión'
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <div style="min-height:100vh;display:grid;place-items:center;padding:1rem">
    <form class="card" style="width:100%;max-width:360px" @submit.prevent="entrar">
      <h1>Iniciar sesión</h1>
      <input v-model="email" type="email" placeholder="Correo" required />
      <input v-model="password" type="password" placeholder="Contraseña" required />
      <p v-if="error" class="error">{{ error }}</p>
      <button class="primary" :disabled="cargando">
        {{ cargando ? 'Entrando…' : 'Entrar' }}
      </button>
      <NuxtLink to="/registro" class="muted">¿No tienes cuenta? Regístrate</NuxtLink>
    </form>
  </div>
</template>