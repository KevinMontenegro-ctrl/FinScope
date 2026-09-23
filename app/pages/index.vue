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
  <div>
    <header class="page-head">
      <h1>{{ saludo }}, {{ usuario?.nombre }}</h1>
      <p class="muted">Resumen de {{ mesNombre }}</p>
    </header>

    <div class="grid">
      <div class="card">
        <p class="muted" style="margin:0">Ingresos del mes</p>
        <p class="stat">{{ money(totalIngresos) }}</p>
      </div>
      <div class="card">
        <p class="muted" style="margin:0">Gastos del mes</p>
        <p class="stat">{{ money(totalGastos) }}</p>
      </div>
      <div class="card">
        <p class="muted" style="margin:0">Balance</p>
        <p class="stat">{{ money(balance) }}</p>
      </div>
      <div class="card">
        <p class="muted" style="margin:0">Tasa de ahorro</p>
        <p class="stat">{{ tasaAhorro }}%</p>
      </div>
    </div>

    <h2>Metas en curso</h2>
    <p v-if="!listaMetas.length" class="muted">Sin metas activas.</p>
    <div v-for="m in listaMetas" :key="m.id" class="card">
      <div style="display:flex;justify-content:space-between;margin-bottom:.6rem">
        <strong style="font-weight:500">{{ m.nombre }}</strong>
        <span class="muted">{{ money(m.montoActual) }} / {{ money(m.montoObjetivo) }}</span>
      </div>
      <div class="bar">
        <span :style="{ width: Math.min(100, (m.montoActual / m.montoObjetivo) * 100) + '%' }"></span>
      </div>
    </div>

    <h2>Últimos movimientos</h2>
    <ul>
      <li v-for="m in ultimos" :key="m.id" class="item">
        <div>
          <div style="font-weight:500">{{ m.descripcion || '(sin descripción)' }}</div>
          <div class="muted" style="margin-top:.15rem">{{ m.fecha.slice(0, 10) }}</div>
        </div>
        <span :style="{ color: m.tipo === 'ingreso' ? 'var(--success)' : 'var(--danger)', fontWeight: 500, fontSize: '0.9rem' }">
          {{ m.tipo === 'ingreso' ? '+' : '−' }} {{ money(m.monto) }}
        </span>
      </li>
      <li v-if="!ultimos.length" class="muted">Sin movimientos aún.</li>
    </ul>
  </div>
</template>

<style scoped>
.page-head { margin-bottom: 2rem; }
.page-head h1 { margin-bottom: 0.25rem; }
.page-head .muted { text-transform: capitalize; }
</style>