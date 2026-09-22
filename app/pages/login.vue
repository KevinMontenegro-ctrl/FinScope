<script setup lang="ts">
import { auth, type Usuario } from '~/database'

const usuario = useState<Usuario | null>('usuario')
const email = ref('')
const password = ref('')
const error = ref('')
const cargando = ref(false)
const mostrarPassword = ref(false)

const entrar = async () => {
  error.value = ''
  if (!email.value || !password.value) {
    error.value = 'Completa todos los campos'
    return
  }

  cargando.value = true
  try {
    const u = await auth.login(email.value, password.value)
    usuario.value = u
    await navigateTo('/')
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Error al iniciar sesión'
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <!-- Fondo decorativo con blobs -->
    <div class="blob blob-1"></div>
    <div class="blob blob-2"></div>

    <form class="login-card" @submit.prevent="entrar">
      <div class="logo">
        <span class="logo-icon">💰</span>
      </div>

      <h1 class="title">Finanzas Personales</h1>
      <p class="subtitle">Inicia sesión para continuar</p>

      <div class="field">
        <label for="email">Correo</label>
        <input
          id="email"
          v-model="email"
          type="email"
          placeholder="tu@correo.com"
          autocomplete="email"
          required
        />
      </div>

      <div class="field">
        <label for="password">Contraseña</label>
        <div class="input-wrap">
          <input
            id="password"
            v-model="password"
            :type="mostrarPassword ? 'text' : 'password'"
            placeholder="••••••••"
            autocomplete="current-password"
            required
          />
          <button
            type="button"
            class="toggle-pass"
            :aria-label="mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            @click="mostrarPassword = !mostrarPassword"
          >
            {{ mostrarPassword ? '🙈' : '👁️' }}
          </button>
        </div>
      </div>

      <transition name="fade">
        <p v-if="error" class="error">{{ error }}</p>
      </transition>

      <button type="submit" class="btn-primary" :disabled="cargando">
        <span v-if="!cargando">Entrar</span>
        <span v-else class="spinner"></span>
      </button>

      <p class="footer">
        ¿No tienes cuenta?
        <NuxtLink to="/registro" class="link">Regístrate</NuxtLink>
      </p>
    </form>
  </div>
</template>

<style scoped>
/* ============ FONDO ============ */
.login-page {
  position: relative;
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  background: radial-gradient(ellipse at top, #2d1b4e 0%, #1a0f2e 50%, #0d0618 100%);
  overflow: hidden;
}

/* Blobs decorativos de fondo */
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.45;
  pointer-events: none;
}
.blob-1 {
  width: 420px;
  height: 420px;
  background: #7c3aed;
  top: -120px;
  left: -120px;
  animation: flotar 12s ease-in-out infinite;
}
.blob-2 {
  width: 380px;
  height: 380px;
  background: #a855f7;
  bottom: -100px;
  right: -100px;
  animation: flotar 15s ease-in-out infinite reverse;
}

@keyframes flotar {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(40px, -30px) scale(1.08); }
}

/* ============ TARJETA ============ */
.login-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 400px;
  padding: 2.5rem 2rem;
  border-radius: 20px;
  background: rgba(30, 18, 51, 0.75);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(168, 85, 247, 0.25);
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(168, 85, 247, 0.08) inset;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  animation: aparecer 0.5s ease-out;
}

@keyframes aparecer {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ============ LOGO ============ */
.logo {
  display: flex;
  justify-content: center;
  margin-bottom: 0.25rem;
}
.logo-icon {
  width: 64px;
  height: 64px;
  display: grid;
  place-items: center;
  font-size: 2rem;
  border-radius: 18px;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  box-shadow: 0 8px 24px rgba(124, 58, 237, 0.45);
}

/* ============ TEXTOS ============ */
.title {
  margin: 0;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #ffffff, #d8b4fe);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.subtitle {
  margin: -0.5rem 0 0.5rem;
  text-align: center;
  font-size: 0.9rem;
  color: #a78bfa;
}

/* ============ CAMPOS ============ */
.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.field label {
  font-size: 0.82rem;
  font-weight: 500;
  color: #c4b5fd;
  letter-spacing: 0.02em;
}
.field input {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  border: 1px solid rgba(168, 85, 247, 0.3);
  background: rgba(13, 6, 24, 0.6);
  color: #f3e8ff;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  outline: none;
}
.field input::placeholder {
  color: #6b5b8a;
}
.field input:focus {
  border-color: #a855f7;
  box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.2);
  background: rgba(13, 6, 24, 0.85);
}

/* Wrap para el ojito de la contraseña */
.input-wrap {
  position: relative;
}
.input-wrap input {
  padding-right: 2.8rem;
}
.toggle-pass {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.3rem;
  border-radius: 6px;
  opacity: 0.7;
  transition: opacity 0.2s;
}
.toggle-pass:hover {
  opacity: 1;
}

/* ============ ERROR ============ */
.error {
  margin: 0;
  padding: 0.65rem 0.85rem;
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.35);
  color: #fca5a5;
  font-size: 0.85rem;
  text-align: center;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ============ BOTÓN ============ */
.btn-primary {
  margin-top: 0.5rem;
  padding: 0.85rem 1rem;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  box-shadow: 0 8px 20px rgba(124, 58, 237, 0.4);
  transition: transform 0.15s, box-shadow 0.2s, opacity 0.2s;
  display: grid;
  place-items: center;
  min-height: 46px;
}
.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 12px 28px rgba(124, 58, 237, 0.55);
}
.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}
.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Spinner simple */
.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: girar 0.7s linear infinite;
}
@keyframes girar {
  to { transform: rotate(360deg); }
}

/* ============ FOOTER ============ */
.footer {
  margin: 0.5rem 0 0;
  text-align: center;
  font-size: 0.88rem;
  color: #a78bfa;
}
.link {
  color: #d8b4fe;
  font-weight: 600;
  text-decoration: none;
  margin-left: 0.25rem;
  transition: color 0.2s;
}
.link:hover {
  color: #fff;
  text-decoration: underline;
}
</style>