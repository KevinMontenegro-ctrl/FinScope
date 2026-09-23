<script setup lang="ts">
import {
  ingresos, categorias, money,
  type Usuario, type Ingreso, type Categoria,
} from '~/database'

const usuario = useState<Usuario | null>('usuario')
const lista = ref<Ingreso[]>([])
const cats = ref<Categoria[]>([])
const form = reactive({ monto: 0, categoriaId: '', descripcion: '', fecha: '' })

const totalMostrado = computed(() => lista.value.reduce((s, i) => s + i.monto, 0))

const cargar = async () => {
  if (!usuario.value) return
  const uid = usuario.value.id
  lista.value = (await ingresos.listar(uid)).sort((a, b) => b.fecha.localeCompare(a.fecha))
  cats.value = await categorias.porTipo(uid, 'ingreso')
}

const agregar = async () => {
  if (!usuario.value || !form.monto || !form.categoriaId) return
  await ingresos.crear({
    usuarioId: usuario.value.id,
    monto: Number(form.monto),
    categoriaId: form.categoriaId,
    descripcion: form.descripcion,
    fecha: form.fecha || new Date().toISOString(),
  })
  Object.assign(form, { monto: 0, categoriaId: '', descripcion: '', fecha: '' })
  await cargar()
}

const eliminar = async (id: string) => {
  await ingresos.eliminar(id)
  await cargar()
}

const nombreCat = (id: string) => cats.value.find(c => c.id === id)?.nombre ?? '—'
const colorCat = (id: string) => cats.value.find(c => c.id === id)?.color ?? '#10b981'

onMounted(cargar)
</script>

<template>
  <div class="page">
    <header class="page-head">
      <div>
        <h1>Ingresos</h1>
        <p class="muted">Registra y controla todos tus ingresos</p>
      </div>
      <div class="head-stat">
        <span class="muted">Total</span>
        <strong class="head-amount success">{{ money(totalMostrado) }}</strong>
      </div>
    </header>

    <section class="card form-card">
      <h2>Nuevo ingreso</h2>
      <form @submit.prevent="agregar">
        <input v-model.number="form.monto" type="number" step="0.01" placeholder="Monto" required />
        <select v-model="form.categoriaId" required>
          <option value="">Selecciona una categoría…</option>
          <option v-for="c in cats" :key="c.id" :value="c.id">{{ c.nombre }}</option>
        </select>
        <input v-model="form.descripcion" placeholder="Descripción (opcional)" />
        <input v-model="form.fecha" type="date" />
        <button class="primary">Agregar ingreso</button>
      </form>
    </section>

    <section class="card list-card">
      <div class="section-head">
        <h2>Historial</h2>
        <span class="count">{{ lista.length }}</span>
      </div>

      <p v-if="!lista.length" class="muted">Sin ingresos registrados.</p>

      <ul v-else>
        <li v-for="i in lista" :key="i.id" class="item">
          <div class="item-info">
            <div class="cat-dot" :style="{ background: colorCat(i.categoriaId) }"></div>
            <div>
              <div class="item-main">
                <span class="item-amount success">{{ money(i.monto) }}</span>
                <span class="muted">— {{ i.descripcion || '(sin descripción)' }}</span>
              </div>
              <div class="muted item-meta">
                {{ nombreCat(i.categoriaId) }} · {{ i.fecha.slice(0, 10) }}
              </div>
            </div>
          </div>
          <button @click="eliminar(i.id)">Eliminar</button>
        </li>
      </ul>
    </section>
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

.head-stat {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.15rem;
}

.head-amount {
  font-family: 'Outfit', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.head-amount.success { color: var(--accent-dark); }

.form-card { padding: 1.25rem 1.35rem; }
.form-card h2 { margin-bottom: 1rem; }
.list-card { padding: 1.25rem 1.35rem; }

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}
.section-head h2 { margin: 0; }

.count {
  display: inline-block;
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  background: var(--bg-soft);
  color: var(--text-muted);
  font-size: 0.72rem;
  font-weight: 600;
}

.item-info { display: flex; align-items: center; gap: 0.8rem; min-width: 0; }

.cat-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.04);
}

.item-main { font-size: 0.9rem; font-weight: 500; color: var(--text); }
.item-amount { font-family: 'Outfit', sans-serif; font-weight: 700; }
.item-amount.success { color: var(--accent-dark); }

.item-meta { margin-top: 0.15rem; font-size: 0.76rem; }
</style>