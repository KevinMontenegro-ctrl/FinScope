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
    <div class="bg-blob bg-blob-1"></div>
    <div class="bg-blob bg-blob-2"></div>

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
/* Reutiliza el mismo bloque que login.vue y añade .wide */
.auth-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  background: var(--bg);
  position: relative;
  overflow: hidden;
}

.bg-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  pointer-events: none;
  z-index: 0;
}
.bg-blob-1 {
  width: 500px; height: 500px;
  background: rgba(0, 0, 0, 0.06);
  top: -180px; left: -180px;
}
.bg-blob-2 {
  width: 450px; height: 450px;
  background: rgba(0, 0, 0, 0.04);
  bottom: -160px; right: -160px;
}

.auth-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
  padding: 2.5rem 2rem 2rem;
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border: 1px solid var(--border-strong);
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  box-shadow: var(--shadow-lg), var(--shadow-glow);
  animation: auth-in 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.auth-card.wide {
  max-height: 95vh;
  overflow-y: auto;
}
@keyframes auth-in {
  from { opacity: 0; transform: translateY(12px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.auth-logo { display: flex; justify-content: center; margin-bottom: 0.25rem; }
.auth-logo-icon {
  width: 56px; height: 56px;
  display: grid; place-items: center;
  font-size: 1.5rem;
  border-radius: 16px;
  background: linear-gradient(135deg, #f5f5f5, #ffffff);
  border: 1px solid var(--border-strong);
  box-shadow: var(--shadow-md);
}

.auth-title {
  margin: 0;
  text-align: center;
  font-family: 'Outfit', sans-serif;
  font-size: 1.55rem;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.03em;
}
.auth-subtitle {
  margin: -0.5rem 0 0.4rem;
  text-align: center;
  font-size: 0.875rem;
  color: var(--text-muted);
}

.auth-field { display: flex; flex-direction: column; gap: 0.4rem; }
.auth-field label { font-size: 0.8rem; font-weight: 500; color: var(--text-muted); }
.auth-field input {
  width: 100%;
  padding: 0.75rem 0.95rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-strong);
  background: var(--bg-elevated);
  color: var(--text);
  font-size: 0.925rem;
  font-family: 'Inter', sans-serif;
  transition: border-color 0.15s, box-shadow 0.15s;
  outline: none;
  box-shadow: var(--shadow-xs);
}
.auth-field input::placeholder { color: var(--text-faint); }
.auth-field input:hover { border-color: var(--border-hover); }
.auth-field input:focus {
  border-color: var(--text);
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.06);
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
  padding: 0.35rem;
  border-radius: 6px;
  opacity: 0.6;
  transition: opacity 0.15s, background 0.15s;
}
.auth-toggle-pass:hover { opacity: 1; background: var(--bg-soft); }

.auth-error {
  margin: 0;
  padding: 0.65rem 0.85rem;
  border-radius: var(--radius-sm);
  background: var(--danger-soft);
  border: 1px solid rgba(220, 38, 38, 0.2);
  color: var(--danger);
  font-size: 0.825rem;
  text-align: center;
}

.auth-btn {
  margin-top: 0.5rem;
  padding: 0.8rem 1rem;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 0.925rem;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  color: var(--accent-text);
  cursor: pointer;
  background: var(--accent);
  transition: background 0.15s, opacity 0.15s, transform 0.1s, box-shadow 0.2s;
  display: grid;
  place-items: center;
  min-height: 46px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
}
.auth-btn:hover:not(:disabled) {
  background: var(--accent-hover);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  transform: translateY(-1px);
}
.auth-btn:active:not(:disabled) { transform: translateY(0); }
.auth-btn:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }

.auth-spinner {
  width: 18px; height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: auth-spin 0.7s linear infinite;
}
@keyframes auth-spin { to { transform: rotate(360deg); } }

.auth-footer {
  margin: 0.4rem 0 0;
  text-align: center;
  font-size: 0.85rem;
  color: var(--text-muted);
}
.auth-link {
  color: var(--text);
  font-weight: 500;
  text-decoration: none;
  margin-left: 0.25rem;
  border-bottom: 1px solid var(--border-strong);
  padding-bottom: 1px;
  transition: border-color 0.15s;
}
.auth-link:hover { border-bottom-color: var(--text); }
</style>