<script setup lang="ts">
import { auth, type Usuario } from '~/database'

const usuario = useState<Usuario | null>('usuario', () => null)
const route = useRoute()
const sidebarAbierto = ref(false)

const salir = async () => {
  await auth.cerrarSesion()
  usuario.value = null
  await navigateTo('/login')
}

const navLinks = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/gastos', label: 'Gastos', icon: '💸' },
  { to: '/ingresos', label: 'Ingresos', icon: '💰' },
  { to: '/metas', label: 'Metas', icon: '🎯' },
  { to: '/presupuestos', label: 'Presupuestos', icon: '📉' },
  { to: '/categorias', label: 'Categorías', icon: '🏷️' },
  { to: '/reportes', label: 'Reportes', icon: '📈' },
  { to: '/ajustes', label: 'Ajustes', icon: '⚙️' },
]

const inicial = computed(() => usuario.value?.nombre?.charAt(0).toUpperCase() ?? '?')

watch(() => route.path, () => (sidebarAbierto.value = false))
</script>

<template>
  <div class="layout">
    <!-- Backdrop móvil -->
    <div
      v-if="sidebarAbierto"
      class="backdrop"
      @click="sidebarAbierto = false"
    ></div>

    <!-- Sidebar -->
    <aside class="sidebar" :class="{ abierto: sidebarAbierto }">
      <!-- Marca -->
      <NuxtLink to="/" class="brand">
        <span class="brand-icon">💰</span>
        <span class="brand-name">FinScope</span>
      </NuxtLink>

      <!-- Nav -->
      <nav class="nav">
        <NuxtLink
          v-for="l in navLinks"
          :key="l.to"
          :to="l.to"
          class="nav-item"
        >
          <span class="nav-icon">{{ l.icon }}</span>
          <span class="nav-label">{{ l.label }}</span>
        </NuxtLink>
      </nav>

      <!-- Tarjeta de ahorro (opcional) -->
      <div class="sidebar-footer">
        <div class="user-chip">
          <div class="avatar">{{ inicial }}</div>
          <div class="user-meta">
            <div class="user-name">{{ usuario?.nombre }}</div>
            <div class="user-email">{{ usuario?.email }}</div>
          </div>
          <button class="logout" @click="salir" title="Cerrar sesión">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </aside>

    <!-- Contenido principal -->
    <div class="main-wrapper">
      <!-- Topbar móvil -->
      <header class="topbar">
        <button class="menu-toggle" @click="sidebarAbierto = !sidebarAbierto" aria-label="Menú">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <NuxtLink to="/" class="topbar-brand">
          <span class="brand-icon-sm">💰</span>
          <span>FinScope</span>
        </NuxtLink>
        <div class="topbar-avatar">{{ inicial }}</div>
      </header>

      <main class="content">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
/* ============ LAYOUT ============ */
.layout {
  min-height: 100vh;
  display: flex;
  position: relative;
}

/* ============ BACKDROP MÓVIL ============ */
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.35);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 90;
  animation: fade-in 0.2s ease-out;
}
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* ============ SIDEBAR ============ */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 240px;
  display: flex;
  flex-direction: column;
  padding: 1.35rem 1rem 1rem;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border-right: 1px solid var(--border);
  z-index: 100;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ============ MARCA ============ */
.brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.4rem 0.6rem;
  margin-bottom: 1.75rem;
}

.brand-icon {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: linear-gradient(135deg, #10b981, #34d399);
  font-size: 0.95rem;
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.35);
}

.brand-name {
  font-family: 'Outfit', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.03em;
}

/* ============ NAV ============ */
.nav {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  flex: 1;
  overflow-y: auto;
  padding-bottom: 1rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.15s;
  position: relative;
}

.nav-item:hover {
  background: var(--bg-soft);
  color: var(--text);
}

.nav-item.router-link-active {
  background: var(--accent-soft);
  color: var(--accent-dark);
  font-weight: 600;
}

.nav-item.router-link-active::before {
  content: '';
  position: absolute;
  left: -1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background: var(--accent);
  border-radius: 0 3px 3px 0;
}

.nav-icon { font-size: 1rem; width: 20px; text-align: center; }
.nav-label { flex: 1; }

/* ============ SIDEBAR FOOTER ============ */
.sidebar-footer {
  border-top: 1px solid var(--border);
  padding-top: 1rem;
}

.user-chip {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem;
  border-radius: var(--radius-sm);
  transition: background 0.15s;
}

.user-chip:hover { background: var(--bg-soft); }

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 0.8rem;
  color: #fff;
  background: linear-gradient(135deg, #10b981, #34d399);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
  flex-shrink: 0;
}

.user-meta {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-email {
  font-size: 0.72rem;
  color: var(--text-dim);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.logout {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 6px;
  background: transparent;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
}

.logout:hover {
  background: var(--danger-soft);
  color: var(--danger);
}

/* ============ MAIN ============ */
.main-wrapper {
  flex: 1;
  margin-left: 240px;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

/* ============ TOPBAR (solo móvil) ============ */
.topbar {
  display: none;
  position: sticky;
  top: 0;
  z-index: 80;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 1px solid var(--border);
  align-items: center;
  gap: 0.75rem;
}

.menu-toggle {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: var(--radius-sm);
  background: transparent;
  border: 1px solid var(--border-strong);
  color: var(--text);
  cursor: pointer;
  transition: background 0.15s;
}

.menu-toggle:hover { background: var(--bg-soft); }

.topbar-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 1rem;
  color: var(--text);
  flex: 1;
}

.brand-icon-sm {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: linear-gradient(135deg, #10b981, #34d399);
  font-size: 0.85rem;
}

.topbar-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 0.8rem;
  color: #fff;
  background: linear-gradient(135deg, #10b981, #34d399);
}

/* ============ CONTENT ============ */
.content {
  flex: 1;
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem 2rem 3rem;
  position: relative;
  z-index: 1;
}

/* ============ RESPONSIVE ============ */
@media (max-width: 900px) {
  .sidebar {
    transform: translateX(-100%);
  }
  .sidebar.abierto {
    transform: translateX(0);
    box-shadow: var(--shadow-xl);
  }
  .main-wrapper {
    margin-left: 0;
  }
  .topbar {
    display: flex;
  }
  .content {
    padding: 1.25rem 1rem 2.5rem;
  }
}
</style>