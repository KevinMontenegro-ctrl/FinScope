import {
  db, uid, now, hashPassword,
  type Usuario, type Gasto, type Ingreso, type Meta,
  type Presupuesto, type Categoria, type Ajustes,
} from './db'

// ============ AUTENTICACIÓN ============
export const auth = {
  async registrar(email: string, nombre: string, password: string) {
    const emailNorm = email.trim().toLowerCase()
    if (!emailNorm || !nombre || password.length < 6) {
      throw new Error('Datos inválidos (contraseña mínima 6 caracteres)')
    }
    const existe = await db.usuarios.where('email').equals(emailNorm).first()
    if (existe) throw new Error('Ese correo ya está registrado')

    const { hash, salt } = await hashPassword(password)
    const usuario: Usuario = {
      id: uid(), email: emailNorm, nombre,
      passwordHash: hash, salt, creadoEn: now(),
    }
    await db.usuarios.add(usuario)
    await seedUsuario(usuario.id)
    await auth.iniciarSesion(usuario.id)
    return usuario
  },

  async login(email: string, password: string) {
    const emailNorm = email.trim().toLowerCase()
    const usuario = await db.usuarios.where('email').equals(emailNorm).first()
    if (!usuario) throw new Error('Credenciales inválidas')
    const { hash } = await hashPassword(password, usuario.salt)
    if (hash !== usuario.passwordHash) throw new Error('Credenciales inválidas')
    await auth.iniciarSesion(usuario.id)
    return usuario
  },

  async iniciarSesion(usuarioId: string) {
    await db.sesiones.clear()
    await db.sesiones.put({ id: 'actual', usuarioId, creadaEn: now() })
  },

  async cerrarSesion() {
    await db.sesiones.clear()
  },

  async usuarioActual(): Promise<Usuario | null> {
    const sesion = await db.sesiones.get('actual')
    if (!sesion) return null
    return (await db.usuarios.get(sesion.usuarioId)) ?? null
  },
}

async function seedUsuario(usuarioId: string) {
  const cats: [string, Categoria['tipo'], string][] = [
    ['Alimentación', 'gasto', '#ef4444'],
    ['Transporte', 'gasto', '#f97316'],
    ['Vivienda', 'gasto', '#8b5cf6'],
    ['Ocio', 'gasto', '#06b6d4'],
    ['Salud', 'gasto', '#10b981'],
    ['Educación', 'gasto', '#f59e0b'],
    ['Salario', 'ingreso', '#22c55e'],
    ['Freelance', 'ingreso', '#3b82f6'],
  ]
  await db.categorias.bulkAdd(
    cats.map(([nombre, tipo, color]) => ({ id: uid(), usuarioId, nombre, tipo, color })),
  )
  await db.ajustes.add({
    id: uid(), usuarioId, moneda: 'EUR', locale: 'es-ES', tema: 'sistema',
  })
}

// ============ CRUD GENÉRICO ============
function crud<T extends { id: string; usuarioId: string }>(tabla: keyof typeof db) {
  return {
    listar: (usuarioId: string) =>
      (db[tabla] as any).where('usuarioId').equals(usuarioId).toArray() as Promise<T[]>,
    crear: (item: Omit<T, 'id' | 'creadoEn'>) =>
      (db[tabla] as any).add({ ...item, id: uid(), creadoEn: now() }) as Promise<string>,
    actualizar: (id: string, cambios: Partial<T>) =>
      (db[tabla] as any).update(id, cambios),
    eliminar: (id: string) => (db[tabla] as any).delete(id),
  }
}

// ============ GASTOS ============
export const gastos = {
  ...crud<Gasto>('gastos'),
  porMes: (usuarioId: string, anio: number, mes: number) => {
    const d = new Date(anio, mes - 1, 1).toISOString()
    const h = new Date(anio, mes, 0, 23, 59, 59).toISOString()
    return db.gastos.where('usuarioId').equals(usuarioId)
      .filter(g => g.fecha >= d && g.fecha <= h).toArray()
  },
  totalMes: async (usuarioId: string, anio: number, mes: number) => {
    const items = await gastos.porMes(usuarioId, anio, mes)
    return items.reduce((s, g) => s + g.monto, 0)
  },
}

// ============ INGRESOS ============
export const ingresos = {
  ...crud<Ingreso>('ingresos'),
  porMes: (usuarioId: string, anio: number, mes: number) => {
    const d = new Date(anio, mes - 1, 1).toISOString()
    const h = new Date(anio, mes, 0, 23, 59, 59).toISOString()
    return db.ingresos.where('usuarioId').equals(usuarioId)
      .filter(i => i.fecha >= d && i.fecha <= h).toArray()
  },
  totalMes: async (usuarioId: string, anio: number, mes: number) => {
    const items = await ingresos.porMes(usuarioId, anio, mes)
    return items.reduce((s, i) => s + i.monto, 0)
  },
}

// ============ METAS ============
export const metas = {
  ...crud<Meta>('metas'),
  aportar: async (id: string, monto: number) => {
    const meta = await db.metas.get(id)
    if (!meta) return
    const total = meta.montoActual + monto
    await db.metas.update(id, {
      montoActual: total,
      completada: total >= meta.montoObjetivo,
    })
  },
}

// ============ PRESUPUESTOS ============
export const presupuestos = crud<Presupuesto>('presupuestos')

// ============ CATEGORÍAS ============
export const categorias = {
  ...crud<Categoria>('categorias'),
  porTipo: (usuarioId: string, tipo: Categoria['tipo']) =>
    db.categorias.where('usuarioId').equals(usuarioId)
      .filter(c => c.tipo === tipo).toArray(),
}

// ============ AJUSTES ============
export const ajustes = {
  obtener: (usuarioId: string) =>
    db.ajustes.where('usuarioId').equals(usuarioId).first() as Promise<Ajustes | undefined>,
  actualizar: (id: string, cambios: Partial<Ajustes>) =>
    db.ajustes.update(id, cambios),
}