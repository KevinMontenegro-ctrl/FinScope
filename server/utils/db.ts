import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { randomUUID } from 'node:crypto'

const DB_PATH = resolve(process.cwd(), 'data/finanzas.db')
mkdirSync(dirname(DB_PATH), { recursive: true })

export const db = new DatabaseSync(DB_PATH)

db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    creado_en TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sesiones (
    id TEXT PRIMARY KEY,
    usuario_id TEXT NOT NULL,
    creada_en TEXT NOT NULL,
    expira_en TEXT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS categorias (
    id TEXT PRIMARY KEY,
    usuario_id TEXT NOT NULL,
    nombre TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('gasto','ingreso')),
    color TEXT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS gastos (
    id TEXT PRIMARY KEY,
    usuario_id TEXT NOT NULL,
    monto REAL NOT NULL,
    categoria_id TEXT NOT NULL,
    descripcion TEXT,
    fecha TEXT NOT NULL,
    creado_en TEXT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS ingresos (
    id TEXT PRIMARY KEY,
    usuario_id TEXT NOT NULL,
    monto REAL NOT NULL,
    categoria_id TEXT NOT NULL,
    descripcion TEXT,
    fecha TEXT NOT NULL,
    creado_en TEXT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS metas (
    id TEXT PRIMARY KEY,
    usuario_id TEXT NOT NULL,
    nombre TEXT NOT NULL,
    monto_objetivo REAL NOT NULL,
    monto_actual REAL NOT NULL DEFAULT 0,
    fecha_limite TEXT,
    completada INTEGER NOT NULL DEFAULT 0,
    creado_en TEXT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS presupuestos (
    id TEXT PRIMARY KEY,
    usuario_id TEXT NOT NULL,
    categoria_id TEXT NOT NULL,
    monto_limite REAL NOT NULL,
    anio INTEGER NOT NULL,
    mes INTEGER,
    creado_en TEXT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS ajustes (
    id TEXT PRIMARY KEY,
    usuario_id TEXT NOT NULL UNIQUE,
    moneda TEXT NOT NULL DEFAULT 'COP',
    locale TEXT NOT NULL DEFAULT 'es-CO',
    tema TEXT NOT NULL DEFAULT 'sistema',
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_gastos_usuario_fecha ON gastos(usuario_id, fecha);
  CREATE INDEX IF NOT EXISTS idx_ingresos_usuario_fecha ON ingresos(usuario_id, fecha);
  CREATE INDEX IF NOT EXISTS idx_categorias_usuario ON categorias(usuario_id);
`)

export const uid = () => randomUUID()
export const now = () => new Date().toISOString()