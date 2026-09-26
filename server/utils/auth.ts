import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { db, uid, now } from './db'

export function hashPassword(password: string, salt?: string) {
  const s = salt ?? randomBytes(16).toString('hex')
  const hash = scryptSync(password, s, 64).toString('hex')
  return { hash, salt: s }
}

export function verifyPassword(password: string, hash: string, salt: string) {
  const { hash: nuevo } = hashPassword(password, salt)
  try {
    return timingSafeEqual(
      Buffer.from(nuevo, 'hex'),
      Buffer.from(hash, 'hex'),
    )
  } catch {
    return false
  }
}

export function crearSesion(usuarioId: string) {
  const id = uid()
  const expiraEn = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  db.prepare(
    'INSERT INTO sesiones (id, usuario_id, creada_en, expira_en) VALUES (?, ?, ?, ?)',
  ).run(id, usuarioId, now(), expiraEn)
  return id
}

export function obtenerUsuarioDeSesion(sessionId: string | undefined) {
  if (!sessionId) return null
  const row = db.prepare(`
    SELECT u.id, u.email, u.nombre, u.creado_en
    FROM sesiones s
    JOIN usuarios u ON u.id = s.usuario_id
    WHERE s.id = ? AND s.expira_en > ?
  `).get(sessionId, now()) as any
  return row ?? null
}

export function cerrarSesion(sessionId: string | undefined) {
  if (!sessionId) return
  db.prepare('DELETE FROM sesiones WHERE id = ?').run(sessionId)
}

export function seedUsuario(usuarioId: string) {
  const cats: [string, 'gasto' | 'ingreso', string][] = [
    ['Alimentación', 'gasto', '#ef4444'],
    ['Transporte', 'gasto', '#f97316'],
    ['Vivienda', 'gasto', '#8b5cf6'],
    ['Ocio', 'gasto', '#06b6d4'],
    ['Salud', 'gasto', '#10b981'],
    ['Educación', 'gasto', '#f59e0b'],
    ['Salario', 'ingreso', '#10b981'],
    ['Freelance', 'ingreso', '#3b82f6'],
  ]
  const ins = db.prepare(
    'INSERT INTO categorias (id, usuario_id, nombre, tipo, color) VALUES (?, ?, ?, ?, ?)',
  )
  for (const [nombre, tipo, color] of cats) {
    ins.run(uid(), usuarioId, nombre, tipo, color)
  }
  db.prepare(
    'INSERT INTO ajustes (id, usuario_id, moneda, locale, tema) VALUES (?, ?, ?, ?, ?)',
  ).run(uid(), usuarioId, 'COP', 'es-CO', 'sistema')
}

export function requireAuth(event: any) {
  const sessionId = getCookie(event, 'finscope_session')
  const user = obtenerUsuarioDeSesion(sessionId)
  if (!user) {
    throw createError({ statusCode: 401, message: 'No autenticado' })
  }
  return { user, sessionId }
}