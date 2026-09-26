import { db, uid, now } from '../utils/db'
import { requireAuth } from '../utils/auth'

// Whitelist de tablas y columnas permitidas
const TABLAS = {
  gastos: ['monto', 'categoria_id', 'descripcion', 'fecha'],
  ingresos: ['monto', 'categoria_id', 'descripcion', 'fecha'],
  metas: ['nombre', 'monto_objetivo', 'fecha_limite'],
  presupuestos: ['categoria_id', 'monto_limite', 'anio', 'mes'],
  categorias: ['nombre', 'tipo', 'color'],
  ajustes: ['moneda', 'locale', 'tema'],
} as const

type TablaValida = keyof typeof TABLAS

export default defineEventHandler(async (event) => {
  const { user } = requireAuth(event)
  const body = await readBody(event)
  const { action, tabla } = body

  // ============ EXPORT ALL ============
  if (action === 'export-all') {
    return {
      gastos: db.prepare('SELECT * FROM gastos WHERE usuario_id = ?').all(user.id),
      ingresos: db.prepare('SELECT * FROM ingresos WHERE usuario_id = ?').all(user.id),
      metas: db.prepare('SELECT * FROM metas WHERE usuario_id = ?').all(user.id),
      presupuestos: db.prepare('SELECT * FROM presupuestos WHERE usuario_id = ?').all(user.id),
      categorias: db.prepare('SELECT * FROM categorias WHERE usuario_id = ?').all(user.id),
      exportadoEn: now(),
    }
  }

  // ============ IMPORT ALL ============
  if (action === 'import-all') {
    const data = body.datos ?? {}
    const tablasImp = ['gastos', 'ingresos', 'metas', 'presupuestos', 'categorias'] as const

    for (const t of tablasImp) {
      if (!Array.isArray(data[t])) continue
      const cols = TABLAS[t] as readonly string[]
      const colsAll = ['id', 'usuario_id', ...cols, 'creado_en']
      const ph = colsAll.map(() => '?').join(', ')
      const ins = db.prepare(`INSERT INTO ${t} (${colsAll.join(', ')}) VALUES (${ph})`)

      for (const item of data[t]) {
        const valores: any[] = [uid(), user.id]
        for (const c of cols) valores.push(item[c] ?? null)
        valores.push(now())
        ins.run(...valores)
      }
    }
    return { ok: true }
  }

  // ============ DELETE ALL ============
  if (action === 'delete-all') {
    for (const t of ['gastos', 'ingresos', 'metas', 'presupuestos'] as const) {
      db.prepare(`DELETE FROM ${t} WHERE usuario_id = ?`).run(user.id)
    }
    return { ok: true }
  }

  // ============ VALIDAR TABLA ============
  if (!tabla || !(tabla in TABLAS)) {
    throw createError({ statusCode: 400, message: 'Tabla inválida' })
  }

  const T = tabla as TablaValida
  const columnas = TABLAS[T] as readonly string[]

  // ============ LIST ============
  if (action === 'list') {
    if (T === 'ajustes') {
      return db.prepare('SELECT * FROM ajustes WHERE usuario_id = ?').get(user.id) ?? null
    }

    if (body.anio && body.mes && (T === 'gastos' || T === 'ingresos')) {
      const d = new Date(body.anio, body.mes - 1, 1).toISOString()
      const h = new Date(body.anio, body.mes, 0, 23, 59, 59).toISOString()
      return db.prepare(
        `SELECT * FROM ${T} WHERE usuario_id = ? AND fecha >= ? AND fecha <= ? ORDER BY fecha DESC`,
      ).all(user.id, d, h)
    }

    if (body.tipo && T === 'categorias') {
      return db.prepare(
        'SELECT * FROM categorias WHERE usuario_id = ? AND tipo = ?',
      ).all(user.id, body.tipo)
    }

    const orden = (T === 'gastos' || T === 'ingresos') ? 'ORDER BY fecha DESC' : ''
    return db.prepare(
      `SELECT * FROM ${T} WHERE usuario_id = ? ${orden}`,
    ).all(user.id)
  }

  // ============ CREATE ============
  if (action === 'create') {
    const id = uid()
    const datos = body.datos ?? {}
    const cols = ['id', 'usuario_id', ...columnas, 'creado_en']
    const valores: any[] = [id, user.id]
    for (const c of columnas) valores.push(datos[c] ?? null)
    valores.push(now())

    const placeholders = cols.map(() => '?').join(', ')
    db.prepare(
      `INSERT INTO ${T} (${cols.join(', ')}) VALUES (${placeholders})`,
    ).run(...valores)

    return db.prepare(`SELECT * FROM ${T} WHERE id = ?`).get(id)
  }

  // ============ DELETE ============
  if (action === 'delete') {
    db.prepare(`DELETE FROM ${T} WHERE id = ? AND usuario_id = ?`).run(body.id, user.id)
    return { ok: true }
  }

  // ============ UPDATE ============
  if (action === 'update') {
    const datos = body.datos ?? {}
    const sets: string[] = []
    const valores: any[] = []

    for (const c of columnas) {
      if (c in datos) {
        sets.push(`${c} = ?`)
        valores.push(datos[c])
      }
    }
    if (!sets.length) return { ok: true }

    valores.push(user.id)
    db.prepare(
      `UPDATE ${T} SET ${sets.join(', ')} WHERE usuario_id = ?`,
    ).run(...valores)
    return { ok: true }
  }

  // ============ APORTAR (meta) ============
  if (action === 'aportar' && T === 'metas') {
    const meta = db.prepare(
      'SELECT * FROM metas WHERE id = ? AND usuario_id = ?',
    ).get(body.id, user.id) as any

    if (!meta) {
      throw createError({ statusCode: 404, message: 'Meta no encontrada' })
    }

    const total = meta.monto_actual + Number(body.monto ?? 0)
    const completada = total >= meta.monto_objetivo ? 1 : 0

    db.prepare(
      'UPDATE metas SET monto_actual = ?, completada = ? WHERE id = ?',
    ).run(total, completada, body.id)

    return db.prepare('SELECT * FROM metas WHERE id = ?').get(body.id)
  }

  throw createError({ statusCode: 400, message: 'Acción inválida' })
})