import {
  hashPassword,
  verifyPassword,
  crearSesion,
  cerrarSesion,
  obtenerUsuarioDeSesion,
  seedUsuario,
} from '../utils/auth'
import { db, uid, now } from '../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const action = body?.action

  // ============ REGISTER ============
  if (action === 'register') {
    const email = String(body.email ?? '').trim().toLowerCase()
    const nombre = String(body.nombre ?? '').trim()
    const password = String(body.password ?? '')

    if (!email || !nombre || password.length < 6) {
      throw createError({ statusCode: 400, message: 'Datos inválidos (contraseña mínima 6 caracteres)' })
    }

    const existe = db.prepare('SELECT id FROM usuarios WHERE email = ?').get(email)
    if (existe) {
      throw createError({ statusCode: 400, message: 'Ese correo ya está registrado' })
    }

    const { hash, salt } = hashPassword(password)
    const id = uid()

    db.prepare(
      'INSERT INTO usuarios (id, email, nombre, password_hash, salt, creado_en) VALUES (?, ?, ?, ?, ?, ?)',
    ).run(id, email, nombre, hash, salt, now())

    seedUsuario(id)

    const sessionId = crearSesion(id)
    setCookie(event, 'finscope_session', sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    })

    return { id, email, nombre }
  }

  // ============ LOGIN ============
  if (action === 'login') {
    const email = String(body.email ?? '').trim().toLowerCase()
    const password = String(body.password ?? '')

    const usuario = db.prepare(
      'SELECT id, email, nombre, password_hash, salt FROM usuarios WHERE email = ?',
    ).get(email) as any

    if (!usuario || !verifyPassword(password, usuario.password_hash, usuario.salt)) {
      throw createError({ statusCode: 401, message: 'Credenciales inválidas' })
    }

    const sessionId = crearSesion(usuario.id)
    setCookie(event, 'finscope_session', sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    })

    return { id: usuario.id, email: usuario.email, nombre: usuario.nombre }
  }

  // ============ LOGOUT ============
  if (action === 'logout') {
    const sessionId = getCookie(event, 'finscope_session')
    cerrarSesion(sessionId)
    deleteCookie(event, 'finscope_session', { path: '/' })
    return { ok: true }
  }

  // ============ ME ============
  if (action === 'me') {
    const sessionId = getCookie(event, 'finscope_session')
    return obtenerUsuarioDeSesion(sessionId) ?? null
  }

  throw createError({ statusCode: 400, message: 'Acción inválida' })
})