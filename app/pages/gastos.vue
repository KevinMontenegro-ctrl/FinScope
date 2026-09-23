<script setup lang="ts">
import {
  gastos, categorias, money,
  type Usuario, type Gasto, type Categoria,
} from '~/database'

const usuario = useState<Usuario | null>('usuario')
const lista = ref<Gasto[]>([])
const cats = ref<Categoria[]>([])
const form = reactive({ monto: 0, categoriaId: '', descripcion: '', fecha: '' })

const totalMostrado = computed(() => lista.value.reduce((s, g) => s + g.monto, 0))

const cargar = async () => {
  if (!usuario.value) return
  const uid = usuario.value.id
  lista.value = (await gastos.listar(uid)).sort((a, b) => b.fecha.localeCompare(a.fecha))
  cats.value = await categorias.porTipo(uid, 'gasto')
}

const agregar = async () => {
  if (!usuario.value || !form.monto || !form.categoriaId) return
  await gastos.crear({
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
  await gastos.eliminar(id)
  await cargar()
}

const nombreCat = (id: string) => cats.value.find(c => c.id === id)?.nombre ?? '—'

onMounted(cargar)
</script>

<template>
  <div>
    <h1>Gastos</h1>

    <form @submit.prevent="agregar">
      <input v-model.number="form.monto" type="number" step="0.01" placeholder="Monto" required />
      <select v-model="form.categoriaId" required>
        <option value="">Selecciona una categoría…</option>
        <option v-for="c in cats" :key="c.id" :value="c.id">{{ c.nombre }}</option>
      </select>
      <input v-model="form.descripcion" placeholder="Descripción (opcional)" />
      <input v-model="form.fecha" type="date" />
      <button class="primary">Agregar gasto</button>
    </form>

    <div class="card" style="display:flex;justify-content:space-between;align-items:center">
      <span class="muted">Total registrado</span>
      <strong style="font-size:1.05rem">{{ money(totalMostrado) }}</strong>
    </div>

    <ul>
      <li v-for="g in lista" :key="g.id" class="item">
        <div>
          <div style="font-weight:500">{{ money(g.monto) }} <span class="muted">— {{ g.descripcion || '(sin descripción)' }}</span></div>
          <div class="muted" style="margin-top:.15rem">{{ nombreCat(g.categoriaId) }} · {{ g.fecha.slice(0, 10) }}</div>
        </div>
        <button @click="eliminar(g.id)">Eliminar</button>
      </li>
      <li v-if="!lista.length" class="muted">Sin gastos registrados.</li>
    </ul>
  </div>
</template>