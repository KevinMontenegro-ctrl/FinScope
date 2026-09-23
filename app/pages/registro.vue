<script setup lang="ts">
import { auth, type Usuario } from '~/database'

definePageMeta({ layout: false })

const usuario = useState<Usuario | null>('usuario')
const nombre = ref('')
const email = ref('')
const password = ref('')
const confirmar = ref('')
const error = ref('')
const cargando = ref(false)
const mostrarPassword = ref(false)
const mostrarConfirmar = ref(false)

const registrar = async () => {
  error.value = ''
  if (!nombre.value || !email.value || !password.value || !confirmar.value) {
    error.value = 'Completa todos los campos'
    return
  }
  if (password.value.length < 6) {
    error.value = 'La contraseña debe tener al menos 6 caracteres'
    return
  }
  if (password.value !== confirmar.value) {
    error.value = 'Las contraseñas no coinciden'
    return
  }

  cargando.value = true
  try {
    const u = await auth.registrar(email.value, nombre.value, password.value)
    usuario.value = u
    await navigateTo('/')
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Error al registrar'
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="blob blob-1"></div>
    <div class="blob blob-2"></div>
    <div class="blob blob-3"></div>

    <form class="auth-card wide" @submit.prevent="registrar">
      <div class="auth-logo">
        <span class="auth-logo-icon">💰</span>
      </div>

      <h1 class="auth-title">Crear cuenta</h1>
      <p class="auth-subtitle">Empieza a gestionar tus finanzas</p>

      <div class="auth-field">
        <label for="nombre">Nombre</label>
        <input id="nombre" v-model="nombre" type="text" placeholder="Tu nombre" autocomplete="name" required />
      </div>

      <div class="auth-field">
        <label for="email">Correo electrónico</label>
        <input id="email" v-model="email" type="email" placeholder="tu@correo.com" autocomplete="email" required />
      </div>

      <div class="auth-field">
        <label for="password">Contraseña</label>
        <div class="auth-input-wrap">
          <input
            id="password"
            v-model="password"
            :type="mostrarPassword ? 'text' : 'password'"
            placeholder="Mínimo 6 caracteres"
            autocomplete="new-password"
            required
          />
          <button type="button" class="auth-toggle-pass" @click="mostrarPassword = !mostrarPassword">
            {{ mostrarPassword ? '🙈' : '👁️' }}
          </button>
        </div>
      </div>

      <div class="auth-field">
        <label for="confirmar">Confirmar contraseña</label>
        <div class="auth-input-wrap">
          <input
            id="confirmar"
            v-model="confirmar"
            :type="mostrarConfirmar ? 'text' : 'password'"
            placeholder="Repite la contraseña"
            autocomplete="new-password"
            required
          />
          <button type="button" class="auth-toggle-pass" @click="mostrarConfirmar = !mostrarConfirmar">
            {{ mostrarConfirmar ? '🙈' : '👁️' }}
          </button>
        </div>
      </div>

      <transition name="fade">
        <p v-if="error" class="auth-error">{{ error }}</p>
      </transition>

      <button type="submit" class="auth-btn" :disabled="cargando">
        <span v-if="!cargando">Crear cuenta</span>
        <span v-else class="auth-spinner"></span>
      </button>

      <p class="auth-footer">
        ¿Ya tienes cuenta?
        <NuxtLink to="/login" class="auth-link">Inicia sesión</NuxtLink>
      </p>
    </form>
  </div>
</template>

<style scoped>
/* Reutiliza el mismo bloque visual que login.vue */
.auth-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  background: radial-gradient(ellipse at top, #f0fdf4 0%, #f6f8fa 50%, #f6f8fa 100%);
  position: relative;
  overflow: hidden;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  pointer-events: none;
  z-index: 0;
}
.blob-1 {
  width: 500px; height: 500px;
  background: rgba(16, 185, 129, 0.25);
  top: -180px; left: -180px;
  animation: flotar 16s ease-in-out infinite;
}
.blob-2 {
  width: 460px; height: 460px;
  background: rgba(59, 130, 246, 0.18);
  bottom: -160px; right: -160px;
  animation: flotar 20s ease-in-out infinite reverse;
}
.blob-3 {
  width: 320px; height: 320px;
  background: rgba(52, 211, 153, 0.15);
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  animation: flotar 24s ease-in-out infinite;
}

@keyframes flotar {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(30px, -25px) scale(1.08); }
}

.auth-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
  padding: 2.5rem 2rem 2rem;
  border-radius: var(--radius-xl);
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: saturate(180%) blur(24px);
  -webkit-backdrop-filter: saturate(180%) blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.9);
  outline: 1px solid rgba(15, 23, 42, 0.05);
  outline-offset: -1px;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  max-height: 95vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl), 0 0 60px rgba(16, 185, 129, 0.08);
  animation: auth-in 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.auth-card.wide { max-width: 420px; }

@keyframes auth-in {
  from { opacity: 0; transform: translateY(14px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.auth-logo { display: flex; justify-content: center; margin-bottom: 0.25rem; }
.auth-logo-icon {
  width: 60px; height: 60px;
  display: grid; place-items: center;
  font-size: 1.6rem;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, #10b981, #34d399);
  box-shadow: 0 10px 24px rgba(16, 185, 129, 0.4);
}

.auth-title {
  margin: 0;
  text-align: center;
  font-family: 'Outfit', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.03em;
}
.auth-subtitle {
  margin: -0.5rem 0 0.4rem;
  text-align: center;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.auth-field { display: flex; flex-direction: column; gap: 0.4rem; }
.auth-field label { font-size: 0.78rem; font-weight: 500; color: var(--text-muted); }
.auth-field input {
  width: 100%;
  padding: 0.75rem 0.95rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-strong);
  background: rgba(255, 255, 255, 0.75);
  color: var(--text);
  font-size: 0.9rem;
  font-family: 'Inter', sans-serif;
  transition: border-color 0.15s, box-shadow 0.15s;
  outline: none;
}
.auth-field input::placeholder { color: var(--text-dim); }
.auth-field input:hover { border-color: var(--border-hover); }
.auth-field input:focus {
  border-color: var(--accent);
  background: #ffffff;
  box-shadow: 0 0 0 4px var(--accent-glow);
}

.auth-input-wrap { position: relative; }
.auth-input-wrap input { padding-right: 2.8rem; }
.auth-toggle-pass {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 0.95rem;
  padding: 0.3rem;
  border-radius: 6px;
  opacity: 0.55;
  transition: opacity 0.15s, background 0.15s;
}
.auth-toggle-pass:hover { opacity: 1; background: var(--bg-soft); }

.auth-error {
  margin: 0;
  padding: 0.65rem 0.85rem;
  border-radius: var(--radius-sm);
  background: var(--danger-soft);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: var(--danger);
  font-size: 0.82rem;
  text-align: center;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-4px); }

.auth-btn {
  margin-top: 0.5rem;
  padding: 0.8rem 1rem;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  color: #ffffff;
  cursor: pointer;
  background: linear-gradient(135deg, #10b981, #059669);
  transition: box-shadow 0.25s, transform 0.1s, opacity 0.15s;
  display: grid;
  place-items: center;
  min-height: 46px;
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.35);
}
.auth-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px rgba(16, 185, 129, 0.45);
}
.auth-btn:active:not(:disabled) { transform: translateY(0); }
.auth-btn:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }

.auth-spinner {
  width: 18px; height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.auth-footer {
  margin: 0.4rem 0 0;
  text-align: center;
  font-size: 0.83rem;
  color: var(--text-muted);
}
.auth-link {
  color: var(--accent-dark);
  font-weight: 600;
  text-decoration: none;
  margin-left: 0.25rem;
  border-bottom: 1px solid transparent;
  padding-bottom: 1px;
  transition: border-color 0.15s;
}
.auth-link:hover { border-bottom-color: var(--accent-dark); }
</style>