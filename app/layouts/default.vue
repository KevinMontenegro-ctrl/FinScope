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
        <!-- Marca -->
        <NuxtLink to="/" class="brand">
          <span class="brand-icon">💰</span>
          <span class="brand-name">FinScope</span>
        </NuxtLink>

        <!-- Nav desktop -->
        <nav class="nav-desktop">
          <NuxtLink
            v-for="l in navLinks"
            :key="l.to"
            :to="l.to"
            class="nav-link"
          >
            {{ l.label }}
          </NuxtLink>
        </nav>

        <!-- Usuario -->
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

        <!-- Botón móvil -->
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

      <!-- Nav móvil -->
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
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* ============ HEADER CON PRESENCIA ============ */
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  /* Fondo blanco SÓLIDO para que se distinga del body */
  background: #ffffff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  /* Sombra suave que separa el header del contenido */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.03);
}

.header-inner {
  max-width: 1160px;
  margin: 0 auto;
  padding: 0.85rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

/* ============ MARCA ============ */
.brand {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  flex-shrink: 0;
}

.brand-icon {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border-radius: 9px;
  background: linear-gradient(135deg, #f5f5f5, #ffffff);
  border: 1px solid rgba(0, 0, 0, 0.1);
  font-size: 0.95rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.brand-name {
  font-family: 'Outfit', sans-serif;
  font-size: 1.05rem;
  font-weight: 700;
  color: #0a0a0a;
  letter-spacing: -0.02em;
}

/* ============ NAV DESKTOP ============ */
.nav-desktop {
  display: flex;
  gap: 0.2rem;
  flex: 1;
  overflow-x: auto;
  scrollbar-width: none;
}
.nav-desktop::-webkit-scrollbar { display: none; }

.nav-link {
  padding: 0.5rem 0.8rem;
  border-radius: 8px;
  color: #525252;
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
  transition: color 0.15s, background 0.15s;
}

.nav-link:hover {
  color: #0a0a0a;
  background: #f5f5f5;
}

.nav-link.router-link-active {
  color: #0a0a0a;
  background: #f5f5f5;
  font-weight: 600;
}

/* ============ ÁREA DE USUARIO ============ */
.user-area {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 0.8rem;
  color: #ffffff;
  background: #171717;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.user-name {
  font-size: 0.85rem;
  color: #525252;
  font-weight: 500;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.logout {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: transparent;
  border: 1px solid rgba(0, 0, 0, 0.1);
  color: #737373;
  cursor: pointer;
  transition: all 0.15s;
}

.logout:hover {
  background: #fef2f2;
  border-color: rgba(220, 38, 38, 0.25);
  color: #dc2626;
}

/* ============ MENÚ MÓVIL ============ */
.menu-toggle {
  display: none;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid rgba(0, 0, 0, 0.1);
  color: #525252;
  cursor: pointer;
  transition: all 0.15s;
  place-items: center;
}

.menu-toggle:hover {
  background: #f5f5f5;
  color: #0a0a0a;
}

.nav-mobile {
  display: flex;
  flex-direction: column;
  padding: 0.5rem 1rem 1rem;
  gap: 0.15rem;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  background: #ffffff;
}

.nav-link-mobile {
  padding: 0.7rem 0.9rem;
  border-radius: 8px;
  color: #525252;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.15s;
}

.nav-link-mobile:hover {
  background: #f5f5f5;
  color: #0a0a0a;
}

.nav-link-mobile.router-link-active {
  background: #f5f5f5;
  color: #0a0a0a;
  font-weight: 600;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: opacity 0.15s, transform 0.2s;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* ============ RESPONSIVE ============ */
@media (max-width: 900px) {
  .nav-desktop { display: none; }
  .menu-toggle { display: grid; }
  .user-name { display: none; }
  .header-inner {
    gap: 0.75rem;
    justify-content: space-between;
  }
}

@media (max-width: 500px) {
  .brand-name { display: none; }
}
</style>