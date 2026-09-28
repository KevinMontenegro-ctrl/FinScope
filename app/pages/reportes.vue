<script setup lang="ts">
import {
  gastos, ingresos, categorias, money,
  type Usuario, type Categoria, type Gasto, type Ingreso,
} from '~/database'

const usuario = useState<Usuario | null>('usuario')
const cats = ref<Categoria[]>([])
const porCategoria = ref<{ nombre: string; total: number; color: string }[]>([])
const porMes = ref<{ mes: string; ingresos: number; gastos: number }[]>([])

onMounted(async () => {
  if (!usuario.value) return
  const uid = usuario.value.id
  cats.value = await categorias.listar(uid)

  const gs = await gastos.listar(uid)
  const ins = await ingresos.listar(uid)

  const mapa = new Map<string, number>()
  for (const g of gs) mapa.set(g.categoriaId, (mapa.get(g.categoriaId) || 0) + g.monto)
  porCategoria.value = [...mapa.entries()]
    .map(([id, total]) => {
      const c = cats.value.find(x => x.id === id)
      return { nombre: c?.nombre ?? '—', color: c?.color ?? '#94a3b8', total }
    })
    .sort((a, b) => b.total - a.total)

  const meses = new Map<string, { ingresos: number; gastos: number }>()
  const push = (fecha: string, campo: 'ingresos' | 'gastos', monto: number) => {
    const key = fecha.slice(0, 7)
    const e = meses.get(key) ?? { ingresos: 0, gastos: 0 }
    e[campo] += monto
    meses.set(key, e)
  }
  ins.forEach((i: Ingreso) => push(i.fecha, 'ingresos', i.monto))
  gs.forEach((g: Gasto) => push(g.fecha, 'gastos', g.monto))
  porMes.value = [...meses.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([mes, v]) => ({ mes, ...v }))
})

const totalGastosHist = computed(() => porCategoria.value.reduce((s, c) => s + c.total, 0))
const totalIngresosHist = computed(() => porMes.value.reduce((s, m) => s + m.ingresos, 0))
const maxMes = computed(() => Math.max(1, ...porMes.value.flatMap(m => [m.ingresos, m.gastos])))
const maxCat = computed(() => Math.max(1, ...porCategoria.value.map(c => c.total)))
</script>

<template>
  <div class="page">
    <header class="page-head">
      <div>
        <h1>Reportes</h1>
        <p class="muted">Análisis de tus finanzas</p>
      </div>
    </header>

    <div class="grid">
      <div class="card stat-card">
        <div class="stat-top">
          <span class="stat-label">Total ingresado</span>
          <span class="stat-icon icon-success">↑</span>
        </div>
        <p class="stat stat-success">{{ money(totalIngresosHist) }}</p>
      </div>
      <div class="card stat-card">
        <div class="stat-top">
          <span class="stat-label">Total gastado</span>
          <span class="stat-icon icon-danger">↓</span>
        </div>
        <p class="stat stat-danger">{{ money(totalGastosHist) }}</p>
      </div>
    </div>

    <section class="card section-card">
      <div class="section-head"><h2>Gastos por categoría (histórico)</h2></div>
      <p v-if="!porCategoria.length" class="muted">Sin datos para mostrar.</p>
      <div v-for="c in porCategoria" :key="c.nombre" class="cat-row">
        <div class="cat-head">
          <strong class="cat-name">
            <span class="cat-dot" :style="{ background: c.color }"></span>
            {{ c.nombre }}
          </strong>
          <span class="muted">{{ money(c.total) }}</span>
        </div>
        <div class="bar">
          <span :style="{ width: (c.total / maxCat * 100) + '%', background: c.color }"></span>
        </div>
      </div>
    </section>

    <section class="card section-card">
      <div class="section-head"><h2>Ingresos vs Gastos (últimos 6 meses)</h2></div>
      <p v-if="!porMes.length" class="muted">Sin datos para mostrar.</p>
      <div v-for="m in porMes" :key="m.mes" class="mes-row">
        <div class="mes-label">{{ m.mes }}</div>

        <div class="mes-line">
          <span class="muted">Ingresos</span>
          <span class="success">{{ money(m.ingresos) }}</span>
        </div>
        <div class="bar" style="margin: .3rem 0 .7rem;">
          <span :style="{ width: (m.ingresos / maxMes * 100) + '%' }"></span>
        </div>

        <div class="mes-line">
          <span class="muted">Gastos</span>
          <span class="danger">{{ money(m.gastos) }}</span>
        </div>
        <div class="bar">
          <span
            :style="{
              width: (m.gastos / maxMes * 100) + '%',
              background: 'linear-gradient(90deg, #dc2626, #f87171)',
            }"
          ></span>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page { display: flex; flex-direction: column; gap: 1.25rem; }

.stat-card { padding: 1.1rem 1.2rem; }
.stat-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.6rem;
}
.stat-label { font-size: 0.8rem; color: var(--text-muted); font-weight: 500; }

.stat-icon {
  width: 26px; height: 26px;
  display: grid; place-items: center;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  font-family: 'Outfit', sans-serif;
}
.icon-success { background: var(--success-soft); color: var(--accent-dark); }
.icon-danger { background: var(--danger-soft); color: var(--danger); }

.stat-success { color: var(--accent-dark); }
.stat-danger { color: var(--danger); }

.section-card { padding: 1.25rem 1.35rem; }
.section-head { margin-bottom: 1rem; }
.section-head h2 { margin: 0; }

.cat-row { padding: 0.7rem 0; }
.cat-row:first-of-type { padding-top: 0; }
.cat-row:last-child { padding-bottom: 0; }

.cat-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}
.cat-name {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.88rem;
  font-weight: 600;
}
.cat-dot {
  width: 10px; height: 10px;
  border-radius: 50%;
  box-shadow: 0 0 0 3px rgba(15,23,42,0.04);
}

.mes-row { padding: 1rem 0; border-bottom: 1px solid var(--border); }
.mes-row:last-child { border-bottom: none; padding-bottom: 0; }
.mes-row:first-of-type { padding-top: 0; }

.mes-label {
  font-family: 'Outfit', sans-serif;
  font-weight: 600;
  font-size: 0.92rem;
  color: var(--text);
  margin-bottom: 0.65rem;
}

.mes-line {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.25rem;
  font-size: 0.83rem;
}

.success { color: var(--accent-dark); font-weight: 600; }
.danger { color: var(--danger); font-weight: 600; }
</style>
