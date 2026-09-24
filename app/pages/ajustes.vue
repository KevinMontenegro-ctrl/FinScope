<script setup lang="ts">
import {
  ajustes, db, auth, setMoneda, MONEDAS_DISPONIBLES,
  type Usuario, type Ajustes,
} from '~/database'

const usuario = useState<Usuario | null>('usuario')
const config = ref<Ajustes | null>(null)
const msg = ref('')
const modalBorrarAbierto = ref(false)

const cargar = async () => {
  if (!usuario.value) return
  config.value = (await ajustes.obtener(usuario.value.id)) ?? null
}

// Aplica el tema al <html> al instante
const aplicarTema = (tema: 'claro' | 'oscuro' | 'sistema') => {
  const html = document.documentElement
  if (tema === 'oscuro') {
    html.classList.add('dark')
  } else if (tema === 'claro') {
    html.classList.remove('dark')
  } else {
    const preferDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    html.classList.toggle('dark', preferDark)
  }
}

// Auto-actualiza el locale al cambiar de moneda
const onCambioMoneda = () => {
  if (!config.value) return
  const encontrada = MONEDAS_DISPONIBLES.find(m => m.code === config.value!.moneda)
  if (encontrada) config.value.locale = encontrada.locale
}

const onCambioTema = () => {
  if (!config.value) return
  aplicarTema(config.value.tema)
}

const guardar = async () => {
  if (!config.value) return
  await ajustes.actualizar(config.value.id, {
    moneda: config.value.moneda,
    locale: config.value.locale,
    tema: config.value.tema,
  })
  setMoneda(config.value.moneda, config.value.locale)
  aplicarTema(config.value.tema)
  mostrar('Ajustes guardados')
}

const exportar = async () => {
  if (!usuario.value) return
  const uid = usuario.value.id
  const data = {
    gastos: await db.gastos.where('usuarioId').equals(uid).toArray(),
    ingresos: await db.ingresos.where('usuarioId').equals(uid).toArray(),
    metas: await db.metas.where('usuarioId').equals(uid).toArray(),
    presupuestos: await db.presupuestos.where('usuarioId').equals(uid).toArray(),
    categorias: await db.categorias.where('usuarioId').equals(uid).toArray(),
    exportadoEn: new Date().toISOString(),
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `finscope-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
  mostrar('Datos exportados')
}

const importar = async (e: Event) => {
  if (!usuario.value) return
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  try {
    const data = JSON.parse(await file.text())
    const uid = usuario.value.id
    for (const tabla of ['gastos', 'ingresos', 'metas', 'presupuestos', 'categorias'] as const) {
      if (Array.isArray(data[tabla])) {
        await (db[tabla] as any).bulkPut(
          data[tabla].map((x: Record<string, unknown>) => ({ ...x, usuarioId: uid })),
        )
      }
    }
    mostrar('Datos importados')
  } catch {
    mostrar('Error al importar JSON')
  }
  input.value = ''
}

// 👇 Abre el modal (ya no usa confirm)
const abrirModalBorrar = () => {
  modalBorrarAbierto.value = true
}

const cancelarBorrar = () => {
  modalBorrarAbierto.value = false
}

const confirmarBorrar = async () => {
  if (!usuario.value) return
  const uid = usuario.value.id
  for (const tabla of ['gastos', 'ingresos', 'metas', 'presupuestos'] as const) {
    const items = await (db[tabla] as any).where('usuarioId').equals(uid).toArray()
    for (const it of items) await (db[tabla] as any).delete(it.id)
  }
  modalBorrarAbierto.value = false
  mostrar('Datos eliminados')
}

const cerrarSesion = async () => {
  await auth.cerrarSesion()
  usuario.value = null
  document.documentElement.classList.remove('dark')
  await navigateTo('/login')
}

const mostrar = (m: string) => {
  msg.value = m
  setTimeout(() => (msg.value = ''), 2500)
}

const previewMoneda = computed(() => {
  if (!config.value) return ''
  const n = 1234567
  const sinDec = ['COP', 'CLP', 'PYG', 'VND', 'JPY', 'KRW', 'IDR'].includes(config.value.moneda)
  return new Intl.NumberFormat(config.value.locale, {
    style: 'currency',
    currency: config.value.moneda,
    minimumFractionDigits: 0,
    maximumFractionDigits: sinDec ? 0 : 2,
  }).format(n)
})

onMounted(cargar)
</script>

<template>
  <div class="page">
    <header class="page-head">
      <div>
        <h1>Ajustes</h1>
        <p class="muted">Personaliza tu experiencia</p>
      </div>
    </header>

    <!-- Preferencias -->
    <section v-if="config" class="card">
      <h2>Preferencias</h2>
      <div class="prefs-grid">
        <label>
          Moneda
          <select v-model="config.moneda" @change="onCambioMoneda">
            <option
              v-for="m in MONEDAS_DISPONIBLES"
              :key="m.code"
              :value="m.code"
            >
              {{ m.code }} — {{ m.nombre }} ({{ m.simbolo }})
            </option>
          </select>
        </label>

        <!-- Locale ahora es solo lectura, se auto-actualiza -->
        <label>
          Locale (formato regional)
          <input
            :value="config.locale"
            disabled
            class="input-disabled"
          />
        </label>

        <label>
          Tema
          <select v-model="config.tema" @change="onCambioTema">
            <option value="claro">Claro</option>
            <option value="oscuro">Oscuro</option>
            <option value="sistema">Sistema (auto)</option>
          </select>
        </label>
      </div>

      <div class="preview-box">
        <span class="muted">Vista previa:</span>
        <span class="preview-valor">{{ previewMoneda }}</span>
      </div>

      <button class="primary" style="margin-top: 1rem;" @click="guardar">
        Guardar cambios
      </button>
    </section>

    <!-- Cuenta -->
    <section class="card cuenta-card">
      <div class="cuenta-info">
        <div class="avatar-lg">{{ usuario?.nombre?.charAt(0).toUpperCase() }}</div>
        <div>
          <div class="cuenta-nombre">{{ usuario?.nombre }}</div>
          <div class="muted">{{ usuario?.email }}</div>
        </div>
      </div>
      <button class="btn-danger" @click="cerrarSesion">Cerrar sesión</button>
    </section>

    <!-- Datos -->
    <section class="card">
      <h2>Datos</h2>
      <p class="muted">Exporta o importa toda tu información en formato JSON.</p>
      <div class="data-actions">
        <button class="primary" @click="exportar">Exportar JSON</button>
        <label class="btn-upload">
          Importar JSON
          <input type="file" accept="application/json" style="display:none" @change="importar" />
        </label>
        <button class="btn-danger" @click="abrirModalBorrar">Borrar todos los datos</button>
      </div>
    </section>

    <!-- Modal de confirmación -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="modalBorrarAbierto" class="modal-backdrop" @click.self="cancelarBorrar">
          <div class="modal">
            <div class="modal-icon">⚠️</div>
            <h3 class="modal-title">¿Borrar todos los datos?</h3>
            <p class="modal-text">
              Se eliminarán <strong>permanentemente</strong> todos tus gastos, ingresos, metas
              y presupuestos. Esta acción no se puede deshacer.
            </p>
            <div class="modal-actions">
              <button class="modal-btn modal-cancel" @click="cancelarBorrar">
                Cancelar
              </button>
              <button class="modal-btn modal-confirm" @click="confirmarBorrar">
                Sí, borrar todo
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <transition name="fade">
      <div v-if="msg" class="toast">{{ msg }}</div>
    </transition>
  </div>
</template>

<style scoped>
.page { display: flex; flex-direction: column; gap: 1.25rem; }

.prefs-grid {
  display: grid;
  gap: 0.85rem;
  margin-top: 0.75rem;
  max-width: 440px;
}

/* Input disabled */
.input-disabled {
  background: var(--bg-soft) !important;
  color: var(--text-dim) !important;
  cursor: not-allowed;
  opacity: 0.8;
}

.preview-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-sm);
  background: var(--surface-soft);
  border: 1px dashed var(--border-strong);
}

.preview-valor {
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 1.05rem;
  color: var(--accent-dark);
  letter-spacing: -0.02em;
}

.cuenta-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.cuenta-info { display: flex; align-items: center; gap: 0.9rem; }

.avatar-lg {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 1.1rem;
  color: #fff;
  background: linear-gradient(135deg, #10b981, #34d399);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.35);
}

.cuenta-nombre {
  font-family: 'Outfit', sans-serif;
  font-weight: 600;
  font-size: 1rem;
  color: var(--text);
}

.data-actions {
  display: flex;
  gap: 0.55rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.btn-upload {
  cursor: pointer;
  padding: 0.68rem 1.15rem;
  border-radius: var(--radius-sm);
  background: transparent;
  border: 1px solid var(--border-strong);
  color: var(--text-muted);
  font-weight: 500;
  font-size: 0.85rem;
  display: inline-flex;
  align-items: center;
  transition: all 0.15s;
}
.btn-upload:hover {
  border-color: var(--border-hover);
  color: var(--text);
  background: var(--bg-soft);
}

/* ============ MODAL ============ */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: grid;
  place-items: center;
  padding: 1.5rem;
  z-index: 1000;
}

.modal {
  width: 100%;
  max-width: 400px;
  background: var(--surface);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-lg);
  padding: 1.75rem 1.5rem 1.5rem;
  text-align: center;
  box-shadow: var(--shadow-xl);
}

.modal-icon {
  width: 52px;
  height: 52px;
  margin: 0 auto 1rem;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--danger-soft);
  font-size: 1.5rem;
}

.modal-title {
  font-family: 'Outfit', sans-serif;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 0.6rem;
  letter-spacing: -0.02em;
}

.modal-text {
  font-size: 0.88rem;
  color: var(--text-muted);
  line-height: 1.55;
  margin: 0 0 1.5rem;
}

.modal-text strong {
  color: var(--text);
  font-weight: 600;
}

.modal-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
}

.modal-btn {
  padding: 0.7rem 1rem;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-weight: 600;
  font-family: 'Inter', inherit;
  cursor: pointer;
  transition: all 0.15s;
  border: 1px solid transparent;
}

.modal-cancel {
  background: transparent;
  border-color: var(--border-strong);
  color: var(--text-muted);
}
.modal-cancel:hover {
  background: var(--bg-soft);
  color: var(--text);
  border-color: var(--border-hover);
}

.modal-confirm {
  background: var(--danger);
  color: #ffffff;
  border-color: var(--danger);
}
.modal-confirm:hover {
  background: #dc2626;
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.35);
}

/* Animaciones del modal */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s;
}
.modal-enter-active .modal,
.modal-leave-active .modal {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal,
.modal-leave-to .modal {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}
</style>