// ============ TIPOS ============
export interface Usuario {
  id: string
  email: string
  nombre: string
  creado_en?: string
}

export interface Gasto {
  id: string
  usuario_id?: string
  monto: number
  categoria_id: string
  descripcion: string
  fecha: string
  creado_en?: string
}

export interface Ingreso {
  id: string
  usuario_id?: string
  monto: number
  categoria_id: string
  descripcion: string
  fecha: string
  creado_en?: string
}

export interface Meta {
  id: string
  usuario_id?: string
  nombre: string
  monto_objetivo: number
  monto_actual: number
  fecha_limite?: string
  completada: boolean
  creado_en?: string
}

export interface Presupuesto {
  id: string
  usuario_id?: string
  categoria_id: string
  monto_limite: number
  anio: number
  mes?: number
  creado_en?: string
}

export interface Categoria {
  id: string
  usuario_id?: string
  nombre: string
  tipo: 'gasto' | 'ingreso'
  color: string
}

export interface Ajustes {
  id: string
  usuario_id?: string
  moneda: string
  locale: string
  tema: 'claro' | 'oscuro' | 'sistema'
}

// ============ MONEDA GLOBAL ============
let _monedaActual = 'COP'
let _localeActual = 'es-CO'

export const setMoneda = (moneda: string, locale: string) => {
  _monedaActual = moneda || 'COP'
  _localeActual = locale || 'es-CO'
}

export const getMoneda = () => ({
  moneda: _monedaActual,
  locale: _localeActual,
})

const SIN_DECIMALES = new Set(['COP', 'CLP', 'PYG', 'VND', 'JPY', 'KRW', 'IDR'])

export const money = (n: number, locale?: string, cur?: string) => {
  const l = locale ?? _localeActual
  const c = cur ?? _monedaActual
  const sinDec = SIN_DECIMALES.has(c)
  return new Intl.NumberFormat(l, {
    style: 'currency',
    currency: c,
    minimumFractionDigits: 0,
    maximumFractionDigits: sinDec ? 0 : 2,
  }).format(n || 0)
}

export const MONEDAS_DISPONIBLES: {
  code: string
  nombre: string
  locale: string
  simbolo: string
}[] = [
  { code: 'COP', nombre: 'Peso colombiano', locale: 'es-CO', simbolo: '$' },
  { code: 'USD', nombre: 'Dólar estadounidense', locale: 'en-US', simbolo: '$' },
  { code: 'EUR', nombre: 'Euro', locale: 'es-ES', simbolo: '€' },
  { code: 'MXN', nombre: 'Peso mexicano', locale: 'es-MX', simbolo: '$' },
  { code: 'ARS', nombre: 'Peso argentino', locale: 'es-AR', simbolo: '$' },
  { code: 'CLP', nombre: 'Peso chileno', locale: 'es-CL', simbolo: '$' },
  { code: 'PEN', nombre: 'Sol peruano', locale: 'es-PE', simbolo: 'S/' },
  { code: 'BRL', nombre: 'Real brasileño', locale: 'pt-BR', simbolo: 'R$' },
  { code: 'GBP', nombre: 'Libra esterlina', locale: 'en-GB', simbolo: '£' },
]

export const uid = () =>
  crypto.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36)