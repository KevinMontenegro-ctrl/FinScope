<script setup lang="ts">
import {
  presupuestos, categorias, gastos, money,
  type Usuario, type Presupuesto, type Categoria, type Gasto,
} from '~/database'

const usuario = useState<Usuario | null>('usuario')
const lista = ref<Presupuesto[]>([])
const cats = ref<Categoria[]>([])
const gastado = ref<Record<string, number>>({})

const hoy = new Date()
const form = reactive({
  categoriaId: '',
  montoLimite: 0,
  anio: hoy.getFullYear(),
  mes: hoy.getMonth() + 1,
})

const cargar = async () => {
  if (!usuario.value) return
  const uid = usuario.value.id
  cats.value = await categorias.porTipo(uid, 'gasto')
  lista.value = (await presupuestos.listar(uid)).filter(
    p => p.anio === form.anio && p.mes === form.mes
  )

  const gs = await gastos.porMes(uid, form.anio, form.mes)
  gastado.value = gs.reduce((acc: Record<string, number>, g: Gasto) => {
    acc[g.categoriaId] = (acc[g.categoriaId] || 0) + g.monto
    return acc
  }, {})
}

const crear = async () => {
  if (!usuario.value || !form.categoriaId || !form.montoLimite) return
  await presupuestos.crear({
    usuarioId: usuario.value.id,
    categoriaId: form.categoriaId,
    montoLimite: Number(form.montoLimite),
    anio: Number(form.anio),
    mes: Number(form.mes),
  })
  Object.assign(form, { categoriaId: '', montoLimite: 0 })
  await cargar()
}

const eliminar = async (id: string) => {
  await presupuestos.eliminar(id)
  await cargar()
}

const nombreCat = (id: string) => cats.value.find(c => c.id === id)?.nombre ?? '—'
const colorCat = (id: string) => cats.value.find(c => c.id === id)?.color ?? '#94a3b8'
const porcentaje = (p: Presupuesto) =>
  Math.min(100, ((gastado.value[p.categoriaId] || 0) / p.montoLimite) * 100)
const excedido = (p: Presupuesto) =>
  (gastado.value[p.categoriaId] || 0) > p.montoLimite

onMounted(cargar)
watch(() => [form.anio, form.mes], cargar)
</script>

<template>
  <div class="page">
    <header class="page-head">
      <div>
        <h1>Presupuestos</h1>
        <p class="muted">Define límites mensuales por categoría</p>
      </div>
    </header>

    <section class="card form-card">
      <h2>Nuevo presupuesto</h2>
      <form @submit.prevent="crear">
        <select v-model="form.categoriaId" required>
          <option value="">Selecciona una categoría…</option>
          <option v-for="c in cats" :key="c.id" :value="c.id">{{ c.nombre }}</option>
        </select>
        <input v-model.number="form.montoLimite" type="number" step="0.01" placeholder="Límite mensual" required />
        <div class="row-2">
          <input v-model.number="form.mes" type="number" min="1" max="12" placeholder="Mes" />
          <input v-model.number="form.anio" type="number" placeholder="Año" />
        </div>
        <button class="primary">Crear presupuesto</button>
      </form>
    </section>

    <h2 class="section-title">Presupuestos de {{ form.mes }}/{{ form.anio }}</h2>

    <p v-if="!lista.length" class="muted">
      Sin presupuestos para este mes. ¡Crea uno para controlar tus gastos!
    </p>

    <div
      v-for="p in lista"
      :key="p.id"
      class="card pres-card"
      :class="{ excedido: excedido(p) }"
    >
      <div class="pres-head">
        <div>
          <div class="pres-name">
            <span class="cat-dot" :style="{ background: colorCat(p.categoriaId) }"></span>
            {{ nombreCat(p.categoriaId) }}
          </div>
          <div class="muted pres-sub">
            {{ money(gastado[p.categoriaId] || 0) }} de {{ money(p.montoLimite) }}
            <span v-if="excedido(p)" class="badge badge-danger">Excedido</span>
          </div>
        </div>
        <button class="btn-danger" @click="eliminar(p.id)">Eliminar</button>
      </div>
      <div class="bar">
        <span
          :style="{
            width: porcentaje(p) + '%',
            background: excedido(p)
              ? 'linear-gradient(90deg, #dc2626, #f87171)'
              : 'linear-gradient(90deg, #059669, #10b981)',
          }"
        ></span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page { display: flex; flex-direction: column; gap: 1.25rem; }

.form-card { padding: 1.25rem 1.35rem; }
.form-card h2 { margin-bottom: 1rem; }

.row-2 { display: flex; gap: 0.5rem; }
.row-2 input { flex: 1; }

.section-title {
  font-family: 'Outfit', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text);
  margin: 0.25rem 0 -0.5rem;
}

.pres-card { transition: border-color 0.2s, background 0.2s; }
.pres-card.excedido {
  background: linear-gradient(135deg, #fef2f2 0%, #ffffff 100%);
  border-color: rgba(239,68,68,0.25);
}

.pres-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  gap: 1rem;
}
.pres-name {
  font-family: 'Outfit', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 0.55rem;
}
.cat-dot {
  width: 10px; height: 10px;
  border-radius: 50%;
  box-shadow: 0 0 0 3px rgba(15,23,42,0.04);
}
.pres-sub { margin-top: 0.3rem; font-size: 0.8rem; }
</style>