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
  ultimos.value = mezcla.sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 6)
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
    <!-- Encabezado de la página -->
    <header class="page-head">
      <h1>{{ saludo }}, {{ usuario?.nombre }}</h1>
      <p class="muted">Resumen de {{ mesNombre }}</p>
    </header>

    <!-- Tarjetas de stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-head">
          <span class="stat-icon stat-icon-success">↑</span>
          <p class="muted">Ingresos del mes</p>
        </div>
        <p class="stat stat-success">{{ money(totalIngresos) }}</p>
      </div>

      <div class="stat-card">
        <div class="stat-head">
          <span class="stat-icon stat-icon-danger">↓</span>
          <p class="muted">Gastos del mes</p>
        </div>
        <p class="stat stat-danger">{{ money(totalGastos) }}</p>
      </div>

      <div class="stat-card">
        <div class="stat-head">
          <span class="stat-icon">=</span>
          <p class="muted">Balance</p>
        </div>
        <p class="stat" :class="balance >= 0 ? 'stat-success' : 'stat-danger'">
          {{ money(balance) }}
        </p>
      </div>

      <div class="stat-card">
        <div class="stat-head">
          <span class="stat-icon">%</span>
          <p class="muted">Tasa de ahorro</p>
        </div>
        <p class="stat">{{ tasaAhorro }}%</p>
      </div>
    </div>

    <!-- Metas en curso -->
    <section class="section">
      <div class="section-head">
        <h2>Metas en curso</h2>
      </div>
      <p v-if="!listaMetas.length" class="muted">Sin metas activas.</p>
      <div v-for="m in listaMetas" :key="m.id" class="card meta-card">
        <div class="meta-head">
          <strong class="meta-name">{{ m.nombre }}</strong>
          <span class="muted">
            {{ money(m.montoActual) }} / {{ money(m.montoObjetivo) }}
          </span>
        </div>
        <div class="bar">
          <span :style="{ width: Math.min(100, (m.montoActual / m.montoObjetivo) * 100) + '%' }"></span>
        </div>
      </div>
    </section>

    <!-- Últimos movimientos -->
    <section class="section">
      <div class="section-head">
        <h2>Últimos movimientos</h2>
      </div>
      <ul v-if="ultimos.length" class="movimientos-list">
        <li v-for="m in ultimos" :key="m.id" class="item movimiento-item">
          <div class="mov-info">
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
            class="amount"
            :class="m.tipo === 'ingreso' ? 'amount-success' : 'amount-danger'"
          >
            {{ m.tipo === 'ingreso' ? '+' : '−' }} {{ money(m.monto) }}
          </span>
        </li>
      </ul>
      <p v-else class="muted">Sin movimientos aún.</p>
    </section>
  </div>
</template>

<style scoped>
.dashboard { position: relative; }

/* ============ ENCABEZADO ============ */
.page-head {
  margin-bottom: 2rem;
}
.page-head h1 {
  margin-bottom: 0.25rem;
}
.page-head .muted {
  text-transform: capitalize;
}

/* ============ STATS GRID ============ */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 14px;
  padding: 1.2rem 1.35rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.02);
  transition: box-shadow 0.2s, transform 0.15s, border-color 0.2s;
}
.stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06), 0 8px 24px rgba(0, 0, 0, 0.04);
  border-color: rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.stat-head {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.stat-icon {
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  border-radius: 6px;
  background: #f5f5f5;
  color: #525252;
  font-size: 0.7rem;
  font-weight: 700;
  font-family: 'Outfit', sans-serif;
}
.stat-icon-success {
  background: #dcfce7;
  color: #16a34a;
}
.stat-icon-danger {
  background: #fee2e2;
  color: #dc2626;
}

.stat {
  font-family: 'Outfit', sans-serif;
  font-size: 1.65rem;
  font-weight: 700;
  margin: 0.6rem 0 0;
  letter-spacing: -0.03em;
  color: #0a0a0a;
}
.stat-success { color: #16a34a; }
.stat-danger { color: #dc2626; }

/* ============ SECCIONES ============ */
.section {
  margin-bottom: 2rem;
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

/* ============ METAS ============ */
.meta-card {
  margin-bottom: 0.75rem;
}

.meta-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.7rem;
}

.meta-name {
  font-family: 'Outfit', sans-serif;
  font-weight: 600;
  font-size: 0.95rem;
  color: #0a0a0a;
}

/* ============ MOVIMIENTOS ============ */
.movimientos-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.movimiento-item {
  padding: 1rem 1.15rem;
}

.mov-info {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.mov-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dot-success { background: #16a34a; }
.dot-danger { background: #dc2626; }

.mov-desc {
  font-weight: 500;
  color: #0a0a0a;
  font-size: 0.9rem;
}

.mov-fecha {
  margin-top: 0.15rem;
  font-size: 0.78rem;
}

.amount {
  font-family: 'Outfit', sans-serif;
  font-weight: 600;
  font-size: 0.95rem;
  white-space: nowrap;
}
.amount-success { color: #16a34a; }
.amount-danger { color: #dc2626; }
</style>