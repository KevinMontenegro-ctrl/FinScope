<script setup lang="ts">
import { auth, type Usuario } from '~/database'

const usuario = useState<Usuario | null>('usuario', () => null)
const route = useRoute()
const menuAbierto = ref(false)

const salir = async () => {
  await auth.cerrarSesion()
  usuario.value = null
  await navigateTo('/login')
}

const navLinks = [
  { to: '/', label: 'Dashboard' },
  { to: '/gastos', label: 'Gastos' },
  { to: '/ingresos', label: 'Ingresos' },
  { to: '/metas', label: 'Metas' },
  { to: '/presupuestos', label: 'Presupuestos' },
  { to: '/categorias', label: 'Categorías' },
  { to: '/reportes', label: 'Reportes' },
  { to: '/ajustes', label: 'Ajustes' },
]

const inicial = computed(() => usuario.value?.nombre?.charAt(0).toUpperCase() ?? '?')

watch(() => route.path, () => (menuAbierto.value = false))
</script>

<template>
  <div class="layout">
    <header class="header">
      <div class="header-inner">
        <NuxtLink to="/" class="brand">
          <span class="brand-icon">💰</span>
          <span class="brand-name">FinScope</span>
        </NuxtLink>

        <nav class="nav-desktop">
          <NuxtLink v-for="l in navLinks" :key="l.to" :to="l.to" class="nav-link">
            {{ l.label }}
          </NuxtLink>
        </nav>

        <div class="user-area">
          <div class="user-info">
            <div class="avatar">{{ inicial }}</div>
            <span class="user-name">{{ usuario?.nombre }}</span>
          </div>
          <button class="logout" @click="salir" title="Cerrar sesión">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>

        <button class="menu-toggle" @click="menuAbierto = !menuAbierto" aria-label="Menú">
          <svg v-if="!menuAbierto" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <transition name="slide-down">
        <nav v-if="menuAbierto" class="nav-mobile">
          <NuxtLink v-for="l in navLinks" :key="l.to" :to="l.to" class="nav-link-mobile">
            {{ l.label }}
          </NuxtLink>
        </nav>
      </transition>
    </header>

    <main>
      <slot />
    </main>
  </div>
</template>

<style scoped>
.layout { min-height: 100vh; display: flex; flex-direction: column; }

.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(10, 10, 10, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
}

.header-inner {
  max-width: 1160px;
  margin: 0 auto;
  padding: 0.85rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.brand { display: flex; align-items: center; gap: 0.55rem; flex-shrink: 0; }
.brand-icon {
  width: 30px; height: 30px;
  display: grid; place-items: center;
  border-radius: 8px;
  background: var(--surface);
  border: 1px solid var(--border-strong);
  font-size: 0.9rem;
}
.brand-name {
  font-family: 'Outfit', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
  letter-spacing: -0.02em;
}

.nav-desktop {
  display: flex;
  gap: 0.15rem;
  flex: 1;
  overflow-x: auto;
  scrollbar-width: none;
}
.nav-desktop::-webkit-scrollbar { display: none; }

.nav-link {
  padding: 0.45rem 0.75rem;
  border-radius: 6px;
  color: var(--text-muted);
  font-size: 0.85rem;
  font-weight: 500;
  white-space: nowrap;
  transition: color 0.15s, background 0.15s;
}
.nav-link:hover { color: var(--text); background: var(--surface); }
.nav-link.router-link-active { color: var(--text); background: var(--surface); }

.user-area { display: flex; align-items: center; gap: 0.75rem; flex-shrink: 0; }
.user-info { display: flex; align-items: center; gap: 0.55rem; }
.avatar {
  width: 28px; height: 28px;
  border-radius: 50%;
  display: grid; place-items: center;
  font-family: 'Outfit', sans-serif;
  font-weight: 600;
  font-size: 0.75rem;
  color: var(--text);
  background: var(--surface);
  border: 1px solid var(--border-strong);
}
.user-name {
  font-size: 0.82rem;
  color: var(--text-muted);
  font-weight: 500;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.logout {
  width: 32px; height: 32px;
  display: grid; place-items: center;
  border-radius: 8px;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-dim);
  cursor: pointer;
  transition: all 0.15s;
}
.logout:hover { border-color: var(--border-hover); color: var(--text); }

.menu-toggle {
  display: none;
  width: 34px; height: 34px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.15s;
  place-items: center;
}
.menu-toggle:hover { border-color: var(--border-hover); color: var(--text); }

.nav-mobile {
  display: flex;
  flex-direction: column;
  padding: 0.5rem 1rem 1rem;
  gap: 0.15rem;
  border-top: 1px solid var(--border);
}
.nav-link-mobile {
  padding: 0.7rem 0.9rem;
  border-radius: 8px;
  color: var(--text-muted);
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.15s;
}
.nav-link-mobile:hover { background: var(--surface); color: var(--text); }
.nav-link-mobile.router-link-active { background: var(--surface); color: var(--text); }

.slide-down-enter-active, .slide-down-leave-active {
  transition: opacity 0.15s, transform 0.2s;
}
.slide-down-enter-from, .slide-down-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 900px) {
  .nav-desktop { display: none; }
  .menu-toggle { display: grid; }
  .user-name { display: none; }
  .header-inner { gap: 0.75rem; justify-content: space-between; }
}
@media (max-width: 500px) {
  .brand-name { display: none; }
}
</style>