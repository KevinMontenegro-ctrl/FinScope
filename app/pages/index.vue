<script setup lang="ts">
import {
  gastos, ingresos, metas, money,
  type Usuario, type Meta, type Gasto, type Ingreso,
} from '~/database'

const usuario = useState<Usuario | null>('usuario')
const supabase = useSupabaseClient()

const totalIngresos = ref(0)
const totalGastos = ref(0)
const countIngresos = ref(0)
const countGastos = ref(0)
const listaMetas = ref<Meta[]>([])
const ultimos = ref<(({ tipo: 'gasto' } & Gasto) | ({ tipo: 'ingreso' } & Ingreso))[]>([])
const cargando = ref(false)
const realtimeActivo = ref(false)

const ahora = new Date()
const anioSeleccionado = ref(ahora.getFullYear())
const mesSeleccionado = ref(ahora.getMonth() + 1)

const meses = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
]

const aniosDisponibles = computed(() => {
  const actual = new Date().getFullYear()
  const lista: number[] = []
  for (let a = actual + 1; a >= actual - 5; a--) lista.push(a)
  return lista
})

const esMesActual = computed(() => {
  const h = new Date()
  return anioSeleccionado.value === h.getFullYear() && mesSeleccionado.value === h.getMonth() + 1
})

const nombreMesSeleccionado = computed(() => {
  const fecha = new Date(anioSeleccionado.value, mesSeleccionado.value - 1)
  return fecha.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
})

const irMesAnterior = () => {
  if (mesSeleccionado.value === 1) {
    mesSeleccionado.value = 12
    anioSeleccionado.value--
  } else {
    mesSeleccionado.value--
  }
}

const irMesSiguiente = () => {
  if (esMesActual.value) return
  if (mesSeleccionado.value === 12) {
    mesSeleccionado.value = 1
    anioSeleccionado.value++
  } else {
    mesSeleccionado.value++
  }
}

const volverMesActual = () => {
  const h = new Date()
  anioSeleccionado.value = h.getFullYear()
  mesSeleccionado.value = h.getMonth() + 1
}

const anchoBarra = (actual: number, objetivo: number) => {
  if (!objetivo) return '0%'
  const pct = Math.min(100, (actual / objetivo) * 100)
  return pct + '%'
}

const cargar = async () => {
  if (!usuario.value) return

  cargando.value = true
  const uid = usuario.value.id
  const anio = anioSeleccionado.value
  const mes = mesSeleccionado.value

  try {
    const ingMes = await ingresos.porMes(uid, anio, mes)
    const gasMes = await gastos.porMes(uid, anio, mes)

    totalIngresos.value = ingMes.reduce((s, i) => s + i.monto, 0)
    totalGastos.value = gasMes.reduce((s, g) => s + g.monto, 0)
    countIngresos.value = ingMes.length
    countGastos.value = gasMes.length

    listaMetas.value = (await metas.listar(uid)).filter(m => !m.completada).slice(0, 3)

    const mezcla = [
      ...gasMes.map(g => ({ ...g, tipo: 'gasto' as const })),
      ...ingMes.map(i => ({ ...i, tipo: 'ingreso' as const })),
    ]
    ultimos.value = mezcla.sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 5)
  } catch (e) {
    console.error('[Dashboard] Error cargando:', e)
  } finally {
    cargando.value = false
  }
}

watch([anioSeleccionado, mesSeleccionado], cargar)

let canal: any = null

const suscribirRealtime = () => {
  if (!usuario.value) return
  if (canal) {
    supabase.removeChannel(canal)
    canal = null
  }

  const uid = usuario.value.id

  canal = supabase
    .channel('dashboard-cambios')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'gastos', filter: 'usuario_id=eq.' + uid },
      () => cargar(),
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'ingresos', filter: 'usuario_id=eq.' + uid },
      () => cargar(),
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'metas', filter: 'usuario_id=eq.' + uid },
      () => cargar(),
    )
    .subscribe((status) => {
      realtimeActivo.value = status === 'SUBSCRIBED'
    })
}

onMounted(async () => {
  await cargar()
  suscribirRealtime()
})

onUnmounted(() => {
  if (canal) {
    supabase.removeChannel(canal)
    canal = null
  }
})

watch(usuario, async (u) => {
  if (u) {
    await cargar()
    suscribirRealtime()
  } else {
    totalIngresos.value = 0
    totalGastos.value = 0
    countIngresos.value = 0
    countGastos.value = 0
    listaMetas.value = []
    ultimos.value = []
  }
})

const balance = computed(() => totalIngresos.value - totalGastos.value)

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
    <div class="page-head">
      <div>
        <h1>{{ saludo }}, {{ usuario?.nombre }} 👋</h1>
        <p class="muted">Resumen de tus finanzas</p>
      </div>
      <div class="head-badge">
        <span class="dot" :class="{ 'is-off': !realtimeActivo }"></span>
        <span>{{ realtimeActivo ? 'En vivo' : 'Desconectado' }}</span>
      </div>
    </div>

    <div class="mes-selector card">
      <button class="nav-btn" title="Mes anterior" @click="irMesAnterior">←</button>

      <select v-model.number="mesSeleccionado" class="picker">
        <option v-for="m in meses" :key="m.value" :value="m.value">{{ m.label }}</option>
      </select>

      <select v-model.number="anioSeleccionado" class="picker">
        <option v-for="a in aniosDisponibles" :key="a" :value="a">{{ a }}</option>
      </select>

      <button class="nav-btn" :disabled="esMesActual" title="Mes siguiente" @click="irMesSiguiente">→</button>

      <div class="mes-info">
        <span class="mes-titulo">{{ nombreMesSeleccionado }}</span>
        <span v-if="esMesActual" class="mes-badge">Mes actual</span>
        <button v-else class="volver-btn" @click="volverMesActual">Volver al mes actual</button>
      </div>

      <button class="refresh-btn" :disabled="cargando" @click="cargar">↻</button>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <p class="stat-label">Ingresos del mes</p>
        <p class="stat stat-success">{{ money(totalIngresos) }}</p>
        <p class="stat-hint">{{ countIngresos }} mov.</p>
      </div>

      <div class="stat-card">
        <p class="stat-label">Gastos del mes</p>
        <p class="stat stat-danger">{{ money(totalGastos) }}</p>
        <p class="stat-hint">{{ countGastos }} mov.</p>
      </div>

      <div class="stat-card">
        <p class="stat-label">Balance</p>
        <p class="stat" :class="balance >= 0 ? 'stat-success' : 'stat-danger'">{{ money(balance) }}</p>
        <p class="stat-hint">{{ nombreMesSeleccionado }}</p>
      </div>

      <div class="stat-card highlight">
        <p class="stat-label">Tasa de ahorro</p>
        <p class="stat stat-accent">{{ tasaAhorro }}%</p>
        <p class="stat-hint">{{ nombreMesSeleccionado }}</p>
      </div>
    </div>

    <div class="main-grid">
      <div class="col-main">
        <div class="card section-card">
          <div class="section-head">
            <h2>Metas en curso</h2>
            <NuxtLink to="/metas" class="link-more">Ver todas →</NuxtLink>
          </div>
          <p v-if="!listaMetas.length" class="muted">Sin metas activas.</p>
          <div v-for="m in listaMetas" :key="m.id" class="meta-row">
            <div class="meta-info">
              <span class="meta-name">{{ m.nombre }}</span>
              <span class="muted meta-amounts">{{ money(m.monto_actual) }} / {{ money(m.monto_objetivo) }}</span>
            </div>
            <div class="bar">
              <span :style="{ width: anchoBarra(m.monto_actual, m.monto_objetivo) }"></span>
            </div>
          </div>
        </div>

        <div class="card section-card">
          <div class="section-head">
            <h2>Movimientos del mes</h2>
            <NuxtLink to="/gastos" class="link-more">Ver todos →</NuxtLink>
          </div>
          <ul v-if="ultimos.length" class="mov-list">
            <li v-for="m in ultimos" :key="m.id" class="mov-item">
              <div class="mov-left">
                <span class="mov-dot" :class="m.tipo === 'ingreso' ? 'dot-success' : 'dot-danger'"></span>
                <div>
                  <div class="mov-desc">{{ m.descripcion || '(sin descripción)' }}</div>
                  <div class="muted mov-fecha">{{ m.fecha.slice(0, 10) }}</div>
                </div>
              </div>
              <span class="mov-amount" :class="m.tipo === 'ingreso' ? 'amount-success' : 'amount-danger'">
                {{ m.tipo === 'ingreso' ? '+' : '−' }} {{ money(m.monto) }}
              </span>
            </li>
          </ul>
          <p v-else class="muted">Sin movimientos en este mes.</p>
        </div>
      </div>

      <div class="col-side">
        <div class="balance-card">
          <div class="balance-head">
            <span>Balance del mes</span>
            <span class="balance-badge">{{ nombreMesSeleccionado }}</span>
          </div>
          <p class="balance-amount" :class="balance >= 0 ? 'positive' : 'negative'">{{ money(balance) }}</p>
          <p class="balance-sub">{{ balance >= 0 ? 'Vas por buen camino' : 'Gastas más de lo que ingresas' }}</p>
        </div>

        <div class="quick-card">
          <h3 class="quick-title">Accesos rápidos</h3>
          <div class="quick-links">
            <NuxtLink to="/gastos" class="quick-link">💸 Nuevo gasto</NuxtLink>
            <NuxtLink to="/ingresos" class="quick-link">💰 Nuevo ingreso</NuxtLink>
            <NuxtLink to="/metas" class="quick-link">🎯 Nueva meta</NuxtLink>
            <NuxtLink to="/presupuestos" class="quick-link">📉 Presupuesto</NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

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
}
.head-badge .dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-glow);
}
.head-badge .dot.is-off {
  background: var(--danger);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
}

.mes-selector {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.85rem 1rem;
  margin-bottom: 0;
  flex-wrap: wrap;
}

.nav-btn {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: var(--bg-soft);
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.15s;
}
.nav-btn:hover:not(:disabled) {
  background: var(--surface);
  color: var(--text);
  border-color: var(--border-hover);
}
.nav-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.picker {
  padding: 0.45rem 0.7rem;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  min-width: 90px;
}

.mes-info {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex: 1;
  min-width: 0;
}

.mes-titulo {
  font-family: 'Outfit', sans-serif;
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text);
  text-transform: capitalize;
}

.mes-badge {
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent-dark);
  font-size: 0.7rem;
  font-weight: 600;
}

.volver-btn {
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  background: transparent;
  border: 1px solid var(--border-strong);
  color: var(--text-muted);
  font-size: 0.72rem;
  font-weight: 500;
  cursor: pointer;
}
.volver-btn:hover {
  background: var(--bg-soft);
  color: var(--text);
}

.refresh-btn {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 1rem;
  cursor: pointer;
}
.refresh-btn:hover:not(:disabled) {
  background: var(--bg-soft);
  color: var(--text);
}
.refresh-btn:disabled {
  opacity: 0.5;
}

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
}
.stat-card.highlight {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(52, 211, 153, 0.04));
  border-color: rgba(16, 185, 129, 0.2);
}

.stat-label {
  font-size: 0.78rem;
  color: var(--text-muted);
  font-weight: 500;
  margin: 0 0 0.5rem;
  text-transform: capitalize;
}

.stat {
  font-family: 'Outfit', sans-serif;
  font-size: 1.55rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.03em;
}
.stat-success { color: var(--accent-dark); }
.stat-danger { color: var(--danger); }
.stat-accent { color: var(--accent-dark); }

.stat-hint {
  margin: 0.35rem 0 0;
  font-size: 0.72rem;
  color: var(--text-dim);
  text-transform: capitalize;
}

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

.section-card {
  padding: 1.25rem 1.35rem;
  margin-bottom: 0;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.section-head h2 {
  margin: 0;
  font-size: 1rem;
}

.link-more {
  font-size: 0.78rem;
  color: var(--accent-dark);
  font-weight: 600;
}

.meta-row {
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border);
}
.meta-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}
.meta-row:first-child {
  padding-top: 0;
}

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
}
.meta-amounts {
  font-size: 0.78rem;
  white-space: nowrap;
}

.mov-list {
  display: flex;
  flex-direction: column;
}
.mov-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border);
}
.mov-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}
.mov-item:first-child {
  padding-top: 0;
}

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
.dot-success {
  background: var(--accent);
}
.dot-danger {
  background: var(--danger);
}

.mov-desc {
  font-weight: 500;
  font-size: 0.87rem;
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

.balance-card {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  border-radius: var(--radius-lg);
  padding: 1.35rem 1.4rem;
  color: #ffffff;
  box-shadow: var(--shadow-lg);
}
.balance-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 0.5rem;
}
.balance-head span:first-child {
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
  text-transform: capitalize;
}
.balance-amount {
  font-family: 'Outfit', sans-serif;
  font-size: 1.85rem;
  font-weight: 700;
  margin: 0 0 0.35rem;
  letter-spacing: -0.03em;
}
.balance-amount.positive { color: #34d399; }
.balance-amount.negative { color: #f87171; }
.balance-sub {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.quick-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.15rem 1.2rem;
  box-shadow: var(--shadow-sm);
}
.quick-title {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 0 0.85rem;
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
  color: var(--text-muted);
  font-size: 0.83rem;
  font-weight: 500;
  transition: all 0.15s;
}
.quick-link:hover {
  background: var(--accent-soft);
  color: var(--accent-dark);
  transform: translateX(2px);
}

@media (max-width: 1024px) {
  .main-grid { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  .stat { font-size: 1.35rem; }
  .balance-amount { font-size: 1.6rem; }
  .picker { min-width: 75px; font-size: 0.8rem; }
}
</style>