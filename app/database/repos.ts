import type {
  Usuario, Gasto, Ingreso, Meta, Presupuesto, Categoria, Ajustes,
} from './db'

// Helpers de fetch con cookies incluidas
const callDb = <T = any>(action: string, payload: any = {}) =>
  $fetch<T>('/api/db', {
    method: 'POST',
    credentials: 'include',
    body: { action, ...payload },
  })

const callAuth = <T = any>(action: string, payload: any = {}) =>
  $fetch<T>('/api/auth', {
    method: 'POST',
    credentials: 'include',
    body: { action, ...payload },
  })

// ============ CONVERSORES snake_case → camelCase ============
const cGasto = (o: any): Gasto => ({
  id: o.id,
  usuario_id: o.usuario_id,
  monto: o.monto,
  categoria_id: o.categoria_id,
  descripcion: o.descripcion,
  fecha: o.fecha,
  creado_en: o.creado_en,
})

const cIngreso = (o: any): Ingreso => ({
  id: o.id,
  usuario_id: o.usuario_id,
  monto: o.monto,
  categoria_id: o.categoria_id,
  descripcion: o.descripcion,
  fecha: o.fecha,
  creado_en: o.creado_en,
})

const cMeta = (o: any): Meta => ({
  id: o.id,
  usuario_id: o.usuario_id,
  nombre: o.nombre,
  monto_objetivo: o.monto_objetivo,
  monto_actual: o.monto_actual,
  fecha_limite: o.fecha_limite,
  completada: !!o.completada,
  creado_en: o.creado_en,
})

const cPres = (o: any): Presupuesto => ({
  id: o.id,
  usuario_id: o.usuario_id,
  categoria_id: o.categoria_id,
  monto_limite: o.monto_limite,
  anio: o.anio,
  mes: o.mes,
  creado_en: o.creado_en,
})

const cCat = (o: any): Categoria => ({
  id: o.id,
  usuario_id: o.usuario_id,
  nombre: o.nombre,
  tipo: o.tipo,
  color: o.color,
})

const cAju = (o: any): Ajustes => ({
  id: o.id,
  usuario_id: o.usuario_id,
  moneda: o.moneda,
  locale: o.locale,
  tema: o.tema,
})

// ============ AUTENTICACIÓN ============
export const auth = {
  registrar: (email: string, nombre: string, password: string) =>
    callAuth<Usuario>('register', { email, nombre, password }),

  login: (email: string, password: string) =>
    callAuth<Usuario>('login', { email, password }),

  iniciarSesion: async (_usuarioId: string) => {
    // La sesión la gestiona el servidor con cookies. No-op.
  },

  cerrarSesion: () => callAuth('logout'),

  usuarioActual: () => callAuth<Usuario | null>('me'),
}

// ============ GASTOS ============
export const gastos = {
  listar: async (_uid: string) => {
    const rows = await callDb<any[]>('list', { tabla: 'gastos' })
    return rows.map(cGasto)
  },

  crear: async (item: any) => {
    const row = await callDb<any>('create', {
      tabla: 'gastos',
      datos: {
        monto: item.monto,
        categoria_id: item.categoriaId,
        descripcion: item.descripcion,
        fecha: item.fecha,
      },
    })
    return cGasto(row)
  },

  eliminar: (id: string) => callDb('delete', { tabla: 'gastos', id }),

  porMes: async (_uid: string, anio: number, mes: number) => {
    const rows = await callDb<any[]>('list', { tabla: 'gastos', anio, mes })
    return rows.map(cGasto)
  },

  totalMes: async (_uid: string, anio: number, mes: number) => {
    const items = await gastos.porMes(_uid, anio, mes)
    return items.reduce((s, g) => s + g.monto, 0)
  },
}

// ============ INGRESOS ============
export const ingresos = {
  listar: async (_uid: string) => {
    const rows = await callDb<any[]>('list', { tabla: 'ingresos' })
    return rows.map(cIngreso)
  },

  crear: async (item: any) => {
    const row = await callDb<any>('create', {
      tabla: 'ingresos',
      datos: {
        monto: item.monto,
        categoria_id: item.categoriaId,
        descripcion: item.descripcion,
        fecha: item.fecha,
      },
    })
    return cIngreso(row)
  },

  eliminar: (id: string) => callDb('delete', { tabla: 'ingresos', id }),

  porMes: async (_uid: string, anio: number, mes: number) => {
    const rows = await callDb<any[]>('list', { tabla: 'ingresos', anio, mes })
    return rows.map(cIngreso)
  },

  totalMes: async (_uid: string, anio: number, mes: number) => {
    const items = await ingresos.porMes(_uid, anio, mes)
    return items.reduce((s, i) => s + i.monto, 0)
  },
}

// ============ METAS ============
export const metas = {
  listar: async (_uid: string) => {
    const rows = await callDb<any[]>('list', { tabla: 'metas' })
    return rows.map(cMeta)
  },

  crear: async (item: any) => {
    const row = await callDb<any>('create', {
      tabla: 'metas',
      datos: {
        nombre: item.nombre,
        monto_objetivo: item.montoObjetivo,
        fecha_limite: item.fechaLimite,
      },
    })
    return cMeta(row)
  },

  eliminar: (id: string) => callDb('delete', { tabla: 'metas', id }),

  aportar: async (id: string, monto: number) => {
    const row = await callDb<any>('aportar', { tabla: 'metas', id, monto })
    return cMeta(row)
  },
}

// ============ PRESUPUESTOS ============
export const presupuestos = {
  listar: async (_uid: string) => {
    const rows = await callDb<any[]>('list', { tabla: 'presupuestos' })
    return rows.map(cPres)
  },

  crear: async (item: any) => {
    const row = await callDb<any>('create', {
      tabla: 'presupuestos',
      datos: {
        categoria_id: item.categoria_id,
        monto_limite: item.monto_limite,
        anio: item.anio,
        mes: item.mes,
      },
    })
    return cPres(row)
  },

  eliminar: (id: string) => callDb('delete', { tabla: 'presupuestos', id }),
}

// ============ CATEGORÍAS ============
export const categorias = {
  listar: async (_uid: string) => {
    const rows = await callDb<any[]>('list', { tabla: 'categorias' })
    return rows.map(cCat)
  },

  porTipo: async (_uid: string, tipo: 'gasto' | 'ingreso') => {
    const rows = await callDb<any[]>('list', { tabla: 'categorias', tipo })
    return rows.map(cCat)
  },

  crear: async (item: any) => {
    const row = await callDb<any>('create', {
      tabla: 'categorias',
      datos: {
        nombre: item.nombre,
        tipo: item.tipo,
        color: item.color,
      },
    })
    return cCat(row)
  },

  eliminar: (id: string) => callDb('delete', { tabla: 'categorias', id }),
}

// ============ AJUSTES ============
export const ajustes = {
  obtener: async (_uid: string) => {
    const row = await callDb<any | null>('list', { tabla: 'ajustes' })
    return row ? cAju(row) : null
  },

  actualizar: async (_id: string, cambios: Partial<Ajustes>) => {
    await callDb('update', { tabla: 'ajustes', datos: cambios })
    return ajustes.obtener('')
  },
}