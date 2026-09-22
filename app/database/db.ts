import Dexie, { type Table } from 'dexie'

// ============ TIPOS ============
export interface Usuario {
  id: string
  email: string
  nombre: string
  passwordHash: string
  salt: string
  creadoEn: string
}

export interface Sesion {
  id: 'actual'
  usuarioId: string
  creadaEn: string
}

export interface Gasto {
  id: string
  usuarioId: string
  monto: number
  categoriaId: string
  descripcion: string
  fecha: string
  creadoEn: string
}

export interface Ingreso {
  id: string
  usuarioId: string
  monto: number
  categoriaId: string
  descripcion: string
  fecha: string
  creadoEn: string
}

export interface Meta {
  id: string
  usuarioId: string
  nombre: string
  montoObjetivo: number
  montoActual: number
  fechaLimite?: string
  completada: boolean
  creadoEn: string
}

export interface Presupuesto {
  id: string
  usuarioId: string
  categoriaId: string
  montoLimite: number
  anio: number
  mes?: number
  creadoEn: string
}

export interface Categoria {
  id: string
  usuarioId: string
  nombre: string
  tipo: 'gasto' | 'ingreso'
  color: string
}

export interface Ajustes {
  id: string
  usuarioId: string
  moneda: string
  locale: string
  tema: 'claro' | 'oscuro' | 'sistema'
}

// ============ HELPERS ============
export const uid = () =>
  crypto.randomUUID?.() ??
  Math.random().toString(36).slice(2) + Date.now().toString(36)

export const now = () => new Date().toISOString()

export const money = (n: number, locale = 'es-ES', cur = 'EUR') =>
  new Intl.NumberFormat(locale, { style: 'currency', currency: cur }).format(n || 0)

export async function hashPassword(password: string, salt?: string) {
  const s = salt ?? uid()
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: enc.encode(s), iterations: 100_000, hash: 'SHA-256' },
    key, 256,
  )
  const hash = Array.from(new Uint8Array(bits))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  return { hash, salt: s }
}

// ============ DEXIE ============
class FinanzasDB extends Dexie {
  usuarios!: Table<Usuario, string>
  sesiones!: Table<Sesion, string>
  gastos!: Table<Gasto, string>
  ingresos!: Table<Ingreso, string>
  metas!: Table<Meta, string>
  presupuestos!: Table<Presupuesto, string>
  categorias!: Table<Categoria, string>
  ajustes!: Table<Ajustes, string>

  constructor() {
    super('FinanzasDB')
    this.version(1).stores({
      usuarios: 'id, &email',
      sesiones: 'id',
      gastos: 'id, usuarioId, fecha, categoriaId',
      ingresos: 'id, usuarioId, fecha, categoriaId',
      metas: 'id, usuarioId, completada',
      presupuestos: 'id, usuarioId, categoriaId, anio, mes',
      categorias: 'id, usuarioId, tipo',
      ajustes: 'id, usuarioId',
    })
  }
}

export const db = new FinanzasDB()