<script setup lang="ts">
import { metas, money, type Usuario, type Meta } from '~/database'

const usuario = useState<Usuario | null>('usuario')
const lista = ref<Meta[]>([])
const form = reactive({ nombre: '', montoObjetivo: 0, fechaLimite: '' })
const aporte = reactive<Record<string, number>>({})

const cargar = async () => {
  if (!usuario.value) return
  lista.value = await metas.listar(usuario.value.id)
}

const crear = async () => {
  if (!usuario.value || !form.nombre || !form.montoObjetivo) return
  await metas.crear({
    usuarioId: usuario.value.id,
    nombre: form.nombre,
    montoObjetivo: Number(form.montoObjetivo),
    montoActual: 0,
    fechaLimite: form.fechaLimite || undefined,
    completada: false,
  })
  Object.assign(form, { nombre: '', montoObjetivo: 0, fechaLimite: '' })
  await cargar()
}

const aportar = async (id: string) => {
  const m = Number(aporte[id] || 0)
  if (!m) return
  await metas.aportar(id, m)
  aporte[id] = 0
  await cargar()
}

const eliminar = async (id: string) => {
  await metas.eliminar(id)
  await cargar()
}

const porcentaje = (m: Meta) => Math.min(100, (m.montoActual / m.montoObjetivo) * 100)
const restante = (m: Meta) => Math.max(0, m.montoObjetivo - m.montoActual)

onMounted(cargar)
</script>

<template>
  <div class="page">
    <header class="page-head">
      <div>
        <h1>Metas de ahorro</h1>
        <p class="muted">Define objetivos y ve tu progreso</p>
      </div>
      <div class="head-stat">
        <span class="muted">Activas</span>
        <strong class="head-amount">{{ lista.filter(m => !m.completada).length }}</strong>
      </div>
    </header>

    <section class="card form-card">
      <h2>Nueva meta</h2>
      <form @submit.prevent="crear">
        <input v-model="form.nombre" placeholder="Nombre de la meta" required />
        <input v-model.number="form.montoObjetivo" type="number" step="0.01" placeholder="Monto objetivo" required />
        <input v-model="form.fechaLimite" type="date" />
        <button class="primary">Crear meta</button>
      </form>
    </section>

    <p v-if="!lista.length" class="muted">Aún no tienes metas. ¡Crea la primera!</p>

    <div
      v-for="m in lista"
      :key="m.id"
      class="card meta-card"
      :class="{ completa: m.completada }"
    >
      <div class="meta-head">
        <div>
          <div class="meta-name">{{ m.nombre }}</div>
          <div class="muted meta-sub">
            {{ money(m.montoActual) }} de {{ money(m.montoObjetivo) }}
            <span v-if="m.completada" class="badge badge-success">Completada</span>
            <span v-else>· faltan {{ money(restante(m)) }}</span>
          </div>
          <div v-if="m.fechaLimite" class="muted meta-fecha">
            Límite: {{ m.fechaLimite.slice(0, 10) }}
          </div>
        </div>
        <div class="porcentaje" :class="{ 'is-complete': m.completada }">
          {{ porcentaje(m).toFixed(0) }}%
        </div>
      </div>

      <div class="bar" style="margin: .9rem 0;">
        <span :style="{ width: porcentaje(m) + '%' }"></span>
      </div>

      <div class="meta-actions">
        <input v-model.number="aporte[m.id]" type="number" step="0.01" placeholder="Cantidad a aportar" />
        <button class="primary" @click="aportar(m.id)">Aportar</button>
        <button class="btn-danger" @click="eliminar(m.id)">Eliminar</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page { display: flex; flex-direction: column; gap: 1.25rem; }

.page-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;
  flex-wrap: wrap;
}
.head-stat { display: flex; flex-direction: column; align-items: flex-end; gap: 0.15rem; }
.head-amount {
  font-family: 'Outfit', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--accent-dark);
}

.form-card { padding: 1.25rem 1.35rem; }
.form-card h2 { margin-bottom: 1rem; }

.meta-card { transition: border-color 0.2s, box-shadow 0.2s; }
.meta-card.completa {
  background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
  border-color: rgba(16,185,129,0.25);
}

.meta-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}
.meta-name {
  font-family: 'Outfit', sans-serif;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text);
}
.meta-sub { margin-top: 0.25rem; font-size: 0.82rem; }
.meta-fecha { margin-top: 0.15rem; font-size: 0.76rem; }

.porcentaje {
  font-family: 'Outfit', sans-serif;
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--text);
  flex-shrink: 0;
}
.porcentaje.is-complete { color: var(--accent-dark); }

.meta-actions { display: flex; gap: 0.5rem; align-items: center; }
.meta-actions input { flex: 1; }
</style>