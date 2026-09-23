<script setup lang="ts">
import {
  gastos, ingresos, metas, money,
  type Usuario, type Meta, type Gasto, type Ingreso,
} from '~/database'

const usuario = useState<Usuario | null>('usuario')
const totalIngresos = ref(0)
const totalGastos = ref(0)
const listaMetas = ref<Meta[]>([])
const ultimos = ref<(({ tipo: 'gasto' } & Gasto) | ({ tipo: 'ingreso' } & Ingreso))[]>([])

const hoy = new Date()
const anio = hoy.getFullYear()
const mes = hoy.getMonth() + 1

onMounted(async () => {
  if (!usuario.value) return
  const uid = usuario.value.id
  totalIngresos.value = await ingresos.totalMes(uid, anio, mes)
  totalGastos.value = await gastos.totalMes(uid, anio, mes)
  listaMetas.value = (await metas.listar(uid)).filter(m => !m.completada).slice(0, 3)

  const gs = await gastos.listar(uid)
  const ins = await ingresos.listar(uid)
  const mezcla = [
    ...gs.map(g => ({ ...g, tipo: 'gasto' as const })),
    ...ins.map(i => ({ ...i, tipo: 'ingreso' as const })),
  ]
  ultimos.value = mezcla.sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 5)
})

const balance = computed(() => totalIngresos.value - totalGastos.value)
const mesNombre = computed(() =>
  new Date(anio, mes - 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
)
const saludo = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 20) return 'Buenas tardes'
  return 'Buenas noches'
})
const tasaAhorro = computed(() => {
  if (!totalIngresos.value) return 0
  return Math.max(0, Math.round((balance.value / totalIngresos.value) * 100))
})
</script>

<template>
  <div class="dashboard">
    <!-- Encabezado -->
    <header class="page-head">
      <div>
        <h1>{{ saludo }}, {{ usuario?.nombre }} 👋</h1>
        <p class="muted">Aquí tienes el resumen de {{ mesNombre }}</p>
      </div>
      <div class="head-badge">
        <span class="dot"></span>
        Sesión activa
      </div>
    </header>

    <!-- Grid de stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-top">
          <span class="stat-label">Ingresos del mes</span>
          <span class="stat-icon icon-success">↑</span>
        </div>
        <p class="stat stat-success">{{ money(totalIngresos) }}</p>
      </div>

      <div class="stat-card">
        <div class="stat-top">
          <span class="stat-label">Gastos del mes</span>
          <span class="stat-icon icon-danger">↓</span>
        </div>
        <p class="stat stat-danger">{{ money(totalGastos) }}</p>
      </div>

      <div class="stat-card">
        <div class="stat-top">
          <span class="stat-label">Balance</span>
          <span class="stat-icon icon-info">=</span>
        </div>
        <p class="stat" :class="balance >= 0 ? 'stat-success' : 'stat-danger'">
          {{ money(balance) }}
        </p>
      </div>

      <div class="stat-card highlight">
        <div class="stat-top">
          <span class="stat-label">Tasa de ahorro</span>
          <span class="stat-icon icon-accent">%</span>
        </div>
        <p class="stat stat-accent">{{ tasaAhorro }}%</p>
      </div>
    </div>

    <!-- Contenido principal: 2 columnas -->
    <div class="main-grid">
      <!-- Columna izquierda -->
      <div class="col-main">
        <!-- Metas -->
        <section class="card section-card">
          <div class="section-head">
            <h2>Metas en curso</h2>
            <NuxtLink to="/metas" class="link-more">Ver todas →</NuxtLink>
          </div>
          <p v-if="!listaMetas.length" class="muted">
            Sin metas activas. ¡Crea una en la sección Metas!
          </p>
          <div v-for="m in listaMetas" :key="m.id" class="meta-row">
            <div class="meta-info">
              <span class="meta-name">{{ m.nombre }}</span>
              <span class="muted meta-amounts">
                {{ money(m.montoActual) }} / {{ money(m.montoObjetivo) }}
              </span>
            </div>
            <div class="bar">
              <span :style="{ width: Math.min(100, (m.montoActual / m.montoObjetivo) * 100) + '%' }"></span>
            </div>
          </div>
        </section>

        <!-- Últimos movimientos -->
        <section class="card section-card">
          <div class="section-head">
            <h2>Últimos movimientos</h2>
            <NuxtLink to="/gastos" class="link-more">Ver todos →</NuxtLink>
          </div>
          <ul v-if="ultimos.length" class="mov-list">
            <li v-for="m in ultimos" :key="m.id" class="mov-item">
              <div class="mov-left">
                <span
                  class="mov-dot"
                  :class="m.tipo === 'ingreso' ? 'dot-success' : 'dot-danger'"
                ></span>
                <div>
                  <div class="mov-desc">{{ m.descripcion || '(sin descripción)' }}</div>
                  <div class="muted mov-fecha">{{ m.fecha.slice(0, 10) }}</div>
                </div>
              </div>
              <span
                class="mov-amount"
                :class="m.tipo === 'ingreso' ? 'amount-success' : 'amount-danger'"
              >
                {{ m.tipo === 'ingreso' ? '+' : '−' }} {{ money(m.monto) }}
              </span>
            </li>
          </ul>
          <p v-else class="muted">Sin movimientos aún.</p>
        </section>
      </div>

      <!-- Columna derecha -->
      <aside class="col-side">
        <!-- Tarjeta de balance destacada -->
        <div class="balance-card">
          <div class="balance-head">
            <span>Balance total</span>
            <span class="balance-badge">Mes actual</span>
          </div>
          <p class="balance-amount" :class="balance >= 0 ? 'positive' : 'negative'">
            {{ money(balance) }}
          </p>
          <p class="balance-sub">
            {{ balance >= 0 ? 'Vas por buen camino 🎉' : 'Gastas más de lo que ingresas' }}
          </p>
        </div>

        <!-- Tarjetas rápidas -->
        <div class="quick-card">
          <div class="quick-head">
            <h3>Accesos rápidos</h3>
          </div>
          <div class="quick-links">
            <NuxtLink to="/gastos" class="quick-link">
              <span class="quick-icon">💸</span>
              <span>Nuevo gasto</span>
            </NuxtLink>
            <NuxtLink to="/ingresos" class="quick-link">
              <span class="quick-icon">💰</span>
              <span>Nuevo ingreso</span>
            </NuxtLink>
            <NuxtLink to="/metas" class="quick-link">
              <span class="quick-icon">🎯</span>
              <span>Nueva meta</span>
            </NuxtLink>
            <NuxtLink to="/presupuestos" class="quick-link">
              <span class="quick-icon">📉</span>
              <span>Presupuesto</span>
            </NuxtLink>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* ============ ENCABEZADO ============ */
.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.page-head h1 {
  margin-bottom: 0.25rem;
}

.head-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.35rem 0.75rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--text-muted);
  box-shadow: var(--shadow-xs);
}

.head-badge .dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-glow);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

/* ============ STATS GRID ============ */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.1rem 1.2rem;
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.2s, transform 0.15s, border-color 0.2s;
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--border-strong);
  transform: translateY(-2px);
}

.stat-card.highlight {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(52, 211, 153, 0.04));
  border-color: rgba(16, 185, 129, 0.2);
}

.stat-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.6rem;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-weight: 500;
}

.stat-icon {
  width: 26px;
  height: 26px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  font-family: 'Outfit', sans-serif;
  flex-shrink: 0;
}

.icon-success { background: var(--success-soft); color: var(--accent-dark); }
.icon-danger { background: var(--danger-soft); color: var(--danger); }
.icon-info { background: var(--info-soft); color: var(--info); }
.icon-accent { background: var(--accent-soft); color: var(--accent-dark); }

.stat {
  font-family: 'Outfit', sans-serif;
  font-size: 1.55rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.03em;
  color: var(--text);
}

.stat-success { color: var(--accent-dark); }
.stat-danger { color: var(--danger); }
.stat-accent { color: var(--accent-dark); }

/* ============ MAIN GRID ============ */
.main-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 1.25rem;
}

.col-main {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
}

.col-side {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* ============ SECCIONES ============ */
.section-card {
  padding: 1.25rem 1.35rem;
  margin-bottom: 0;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.section-head h2 {
  margin: 0;
}

.link-more {
  font-size: 0.78rem;
  color: var(--accent-dark);
  font-weight: 600;
  transition: opacity 0.15s;
}

.link-more:hover { opacity: 0.75; }

/* ============ METAS ============ */
.meta-row {
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border);
}

.meta-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.meta-row:first-child { padding-top: 0; }

.meta-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.55rem;
  gap: 1rem;
}

.meta-name {
  font-family: 'Outfit', sans-serif;
  font-weight: 600;
  font-size: 0.88rem;
  color: var(--text);
}

.meta-amounts {
  font-size: 0.78rem;
  white-space: nowrap;
}

/* ============ MOVIMIENTOS ============ */
.mov-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.mov-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border);
}

.mov-item:last-child { border-bottom: none; padding-bottom: 0; }
.mov-item:first-child { padding-top: 0; }

.mov-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.mov-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot-success { background: var(--accent); box-shadow: 0 0 0 3px var(--accent-glow); }
.dot-danger { background: var(--danger); box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15); }

.mov-desc {
  font-weight: 500;
  font-size: 0.87rem;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mov-fecha {
  margin-top: 0.1rem;
  font-size: 0.74rem;
}

.mov-amount {
  font-family: 'Outfit', sans-serif;
  font-weight: 600;
  font-size: 0.88rem;
  white-space: nowrap;
  flex-shrink: 0;
}

.amount-success { color: var(--accent-dark); }
.amount-danger { color: var(--danger); }

/* ============ BALANCE CARD (columna derecha) ============ */
.balance-card {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  border-radius: var(--radius-lg);
  padding: 1.35rem 1.4rem;
  color: #ffffff;
  box-shadow: var(--shadow-lg);
  position: relative;
  overflow: hidden;
}

.balance-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.4), transparent 70%);
  filter: blur(40px);
  pointer-events: none;
}

.balance-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  position: relative;
  z-index: 1;
}

.balance-head > span:first-child {
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

.balance-badge {
  padding: 0.2rem 0.55rem;
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 600;
}

.balance-amount {
  font-family: 'Outfit', sans-serif;
  font-size: 1.85rem;
  font-weight: 700;
  margin: 0 0 0.35rem;
  letter-spacing: -0.03em;
  position: relative;
  z-index: 1;
}

.balance-amount.positive { color: #34d399; }
.balance-amount.negative { color: #f87171; }

.balance-sub {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  position: relative;
  z-index: 1;
}

/* ============ QUICK CARD ============ */
.quick-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.15rem 1.2rem;
  box-shadow: var(--shadow-sm);
}

.quick-head {
  margin-bottom: 0.85rem;
}

.quick-head h3 {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text);
}

.quick-links {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.quick-link {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.6rem 0.75rem;
  border-radius: var(--radius-sm);
  background: var(--surface-soft);
  border: 1px solid transparent;
  color: var(--text-muted);
  font-size: 0.83rem;
  font-weight: 500;
  transition: all 0.15s;
}

.quick-link:hover {
  background: var(--accent-soft);
  color: var(--accent-dark);
  border-color: rgba(16, 185, 129, 0.2);
  transform: translateX(2px);
}

.quick-icon {
  font-size: 1rem;
  width: 20px;
  text-align: center;
}

/* ============ RESPONSIVE ============ */
@media (max-width: 1024px) {
  .main-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .stat { font-size: 1.35rem; }
  .balance-amount { font-size: 1.6rem; }
  .page-head { gap: 0.75rem; }
}
</style>