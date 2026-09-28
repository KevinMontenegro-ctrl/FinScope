<script setup lang="ts">
import { categorias, type Usuario, type Categoria } from '~/database'

const usuario = useState<Usuario | null>('usuario')
const lista = ref<Categoria[]>([])
const form = reactive<{ nombre: string; tipo: 'gasto' | 'ingreso'; color: string }>({
  nombre: '',
  tipo: 'gasto',
  color: '#10b981',
})

const gastos = computed(() => lista.value.filter(c => c.tipo === 'gasto'))
const ingresosCat = computed(() => lista.value.filter(c => c.tipo === 'ingreso'))

const cargar = async () => {
  if (!usuario.value) return
  lista.value = await categorias.listar(usuario.value.id)
}

const crear = async () => {
  if (!usuario.value || !form.nombre) return
  await categorias.crear({
    usuarioId: usuario.value.id,
    nombre: form.nombre,
    tipo: form.tipo,
    color: form.color,
  })
  Object.assign(form, { nombre: '', tipo: 'gasto', color: '#10b981' })
  await cargar()
}

const eliminar = async (id: string) => {
  await categorias.eliminar(id)
  await cargar()
}

onMounted(cargar)
</script>

<template>
  <div class="page">
    <header class="page-head">
      <div>
        <h1>Categorías</h1>
        <p class="muted">Organiza tus movimientos con colores</p>
      </div>
    </header>

    <section class="card form-card">
      <h2>Nueva categoría</h2>
      <form @submit.prevent="crear">
        <input v-model="form.nombre" placeholder="Nombre de la categoría" required />
        <select v-model="form.tipo">
          <option value="gasto">Gasto</option>
          <option value="ingreso">Ingreso</option>
        </select>
        <label>
          Color
          <input v-model="form.color" type="color" />
        </label>
        <button class="primary">Agregar categoría</button>
      </form>
    </section>

    <section class="grupo">
      <div class="grupo-head">
        <h2>Gastos</h2>
        <span class="count">{{ gastos.length }}</span>
      </div>
      <ul>
        <li v-for="c in gastos" :key="c.id" class="item">
          <span class="cat-row">
            <span
              class="cat-dot-lg"
              :style="{ background: c.color, boxShadow: `0 0 0 3px ${c.color}22` }"
            ></span>
            {{ c.nombre }}
          </span>
          <button @click="eliminar(c.id)">Eliminar</button>
        </li>
        <li v-if="!gastos.length" class="muted">Sin categorías de gasto.</li>
      </ul>
    </section>

    <section class="grupo">
      <div class="grupo-head">
        <h2>Ingresos</h2>
        <span class="count">{{ ingresosCat.length }}</span>
      </div>
      <ul>
        <li v-for="c in ingresosCat" :key="c.id" class="item">
          <span class="cat-row">
            <span
              class="cat-dot-lg"
              :style="{ background: c.color, boxShadow: `0 0 0 3px ${c.color}22` }"
            ></span>
            {{ c.nombre }}
          </span>
          <button @click="eliminar(c.id)">Eliminar</button>
        </li>
        <li v-if="!ingresosCat.length" class="muted">Sin categorías de ingreso.</li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.page { display: flex; flex-direction: column; gap: 1.25rem; }

.form-card { padding: 1.25rem 1.35rem; }
.form-card h2 { margin-bottom: 1rem; }

.grupo { display: flex; flex-direction: column; gap: 0.75rem; }
.grupo-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.count {
  display: inline-block;
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  background: var(--bg-soft);
  color: var(--text-muted);
  font-size: 0.72rem;
  font-weight: 600;
}

.cat-row {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  font-weight: 500;
}
.cat-dot-lg {
  width: 14px; height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
}
</style>