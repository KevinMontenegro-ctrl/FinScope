import type {
  Usuario, Gasto, Ingreso, Meta, Presupuesto, Categoria, Ajustes,
} from './db'

// ============ CONVERSORES ============
const cGasto = (o: any): Gasto => ({
  id: o.id,
  usuario_id: o.usuario_id,
  monto: Number(o.monto),
  categoria_id: o.categoria_id,
  descripcion: o.descripcion ?? '',
  fecha: o.fecha,
  creado_en: o.creado_en,
})

const cIngreso = (o: any): Ingreso => ({
  id: o.id,
  usuario_id: o.usuario_id,
  monto: Number(o.monto),
  categoria_id: o.categoria_id,
  descripcion: o.descripcion ?? '',
  fecha: o.fecha,
  creado_en: o.creado_en,
})

const cMeta = (o: any): Meta => ({
  id: o.id,
  usuario_id: o.usuario_id,
  nombre: o.nombre,
  monto_objetivo: Number(o.monto_objetivo),
  monto_actual: Number(o.monto_actual),
  fecha_limite: o.fecha_limite ?? undefined,
  completada: !!o.completada,
  creado_en: o.creado_en,
})

const cPres = (o: any): Presupuesto => ({
  id: o.id,
  usuario_id: o.usuario_id,
  categoria_id: o.categoria_id,
  monto_limite: Number(o.monto_limite),
  anio: o.anio,
  mes: o.mes ?? undefined,
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
  registrar: async (email: string, nombre: string, password: string) => {
    const supabase = useSupabaseClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre } },
    })
    if (error) throw new Error(error.message)
    return {
      id: data.user?.id ?? '',
      email: data.user?.email ?? email,
      nombre,
    }
  },

  login: async (email: string, password: string) => {
    const supabase = useSupabaseClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error('Credenciales inválidas')
    return {
      id: data.user?.id ?? '',
      email: data.user?.email ?? email,
      nombre: data.user?.user_metadata?.nombre ?? 'Usuario',
    }
  },

  iniciarSesion: async (_usuarioId: string) => {
    // Supabase maneja la sesión automáticamente
  },

  cerrarSesion: async () => {
    const supabase = useSupabaseClient()
    await supabase.auth.signOut()
  },

  usuarioActual: async (): Promise<Usuario | null> => {
    const supabase = useSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    return {
      id: user.id,
      email: user.email ?? '',
      nombre: user.user_metadata?.nombre ?? 'Usuario',
    }
  },
}

// ============ GASTOS ============
export const gastos = {
  listar: async (_uid: string): Promise<Gasto[]> => {
    const supabase = useSupabaseClient()
    const { data, error } = await supabase
      .from('gastos')
      .select('*')
      .order('fecha', { ascending: false })
    if (error) throw new Error(error.message)
    return (data ?? []).map(cGasto)
  },

  crear: async (item: any): Promise<Gasto> => {
    const supabase = useSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { data, error } = await supabase
      .from('gastos')
      .insert({
        usuario_id: user.id,
        monto: item.monto,
        categoria_id: item.categoriaId || item.categoria_id,
        descripcion: item.descripcion,
        fecha: item.fecha,
      })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return cGasto(data)
  },

  eliminar: async (id: string): Promise<void> => {
    const supabase = useSupabaseClient()
    const { error } = await supabase.from('gastos').delete().eq('id', id)
    if (error) throw new Error(error.message)
  },

  porMes: async (_uid: string, anio: number, mes: number): Promise<Gasto[]> => {
    const supabase = useSupabaseClient()
    const inicio = new Date(anio, mes - 1, 1).toISOString()
    const fin = new Date(anio, mes, 0, 23, 59, 59).toISOString()
    const { data, error } = await supabase
      .from('gastos')
      .select('*')
      .gte('fecha', inicio)
      .lte('fecha', fin)
      .order('fecha', { ascending: false })
    if (error) throw new Error(error.message)
    return (data ?? []).map(cGasto)
  },

  totalMes: async (_uid: string, anio: number, mes: number): Promise<number> => {
    const items = await gastos.porMes(_uid, anio, mes)
    return items.reduce((s, g) => s + g.monto, 0)
  },
}

// ============ INGRESOS ============
export const ingresos = {
  listar: async (_uid: string): Promise<Ingreso[]> => {
    const supabase = useSupabaseClient()
    const { data, error } = await supabase
      .from('ingresos')
      .select('*')
      .order('fecha', { ascending: false })
    if (error) throw new Error(error.message)
    return (data ?? []).map(cIngreso)
  },

  crear: async (item: any): Promise<Ingreso> => {
    const supabase = useSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { data, error } = await supabase
      .from('ingresos')
      .insert({
        usuario_id: user.id,
        monto: item.monto,
        categoria_id: item.categoriaId || item.categoria_id,
        descripcion: item.descripcion,
        fecha: item.fecha,
      })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return cIngreso(data)
  },

  eliminar: async (id: string): Promise<void> => {
    const supabase = useSupabaseClient()
    const { error } = await supabase.from('ingresos').delete().eq('id', id)
    if (error) throw new Error(error.message)
  },

  porMes: async (_uid: string, anio: number, mes: number): Promise<Ingreso[]> => {
    const supabase = useSupabaseClient()
    const inicio = new Date(anio, mes - 1, 1).toISOString()
    const fin = new Date(anio, mes, 0, 23, 59, 59).toISOString()
    const { data, error } = await supabase
      .from('ingresos')
      .select('*')
      .gte('fecha', inicio)
      .lte('fecha', fin)
      .order('fecha', { ascending: false })
    if (error) throw new Error(error.message)
    return (data ?? []).map(cIngreso)
  },

  totalMes: async (_uid: string, anio: number, mes: number): Promise<number> => {
    const items = await ingresos.porMes(_uid, anio, mes)
    return items.reduce((s, i) => s + i.monto, 0)
  },
}

// ============ METAS ============
export const metas = {
  listar: async (_uid: string): Promise<Meta[]> => {
    const supabase = useSupabaseClient()
    const { data, error } = await supabase
      .from('metas')
      .select('*')
      .order('creado_en', { ascending: false })
    if (error) throw new Error(error.message)
    return (data ?? []).map(cMeta)
  },

  crear: async (item: any): Promise<Meta> => {
    const supabase = useSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { data, error } = await supabase
      .from('metas')
      .insert({
        usuario_id: user.id,
        nombre: item.nombre,
        monto_objetivo: item.montoObjetivo || item.monto_objetivo,
        monto_actual: 0,
        fecha_limite: item.fechaLimite || item.fecha_limite || null,
        completada: false,
      })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return cMeta(data)
  },

  eliminar: async (id: string): Promise<void> => {
    const supabase = useSupabaseClient()
    const { error } = await supabase.from('metas').delete().eq('id', id)
    if (error) throw new Error(error.message)
  },

  aportar: async (id: string, monto: number): Promise<Meta> => {
    const supabase = useSupabaseClient()
    const { data, error } = await supabase.rpc('aportar_meta', {
      meta_id: id,
      monto,
    })
    if (error) throw new Error(error.message)
    return cMeta(Array.isArray(data) ? data[0] : data)
  },
}

// ============ PRESUPUESTOS ============
export const presupuestos = {
  listar: async (_uid: string): Promise<Presupuesto[]> => {
    const supabase = useSupabaseClient()
    const { data, error } = await supabase
      .from('presupuestos')
      .select('*')
      .order('anio', { ascending: false })
    if (error) throw new Error(error.message)
    return (data ?? []).map(cPres)
  },

  crear: async (item: any): Promise<Presupuesto> => {
    const supabase = useSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { data, error } = await supabase
      .from('presupuestos')
      .insert({
        usuario_id: user.id,
        categoria_id: item.categoriaId || item.categoria_id,
        monto_limite: item.montoLimite || item.monto_limite,
        anio: item.anio,
        mes: item.mes,
      })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return cPres(data)
  },

  eliminar: async (id: string): Promise<void> => {
    const supabase = useSupabaseClient()
    const { error } = await supabase.from('presupuestos').delete().eq('id', id)
    if (error) throw new Error(error.message)
  },
}

// ============ CATEGORÍAS ============
export const categorias = {
  listar: async (_uid: string): Promise<Categoria[]> => {
    const supabase = useSupabaseClient()
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .order('nombre', { ascending: true })
    if (error) throw new Error(error.message)
    return (data ?? []).map(cCat)
  },

  porTipo: async (_uid: string, tipo: 'gasto' | 'ingreso'): Promise<Categoria[]> => {
    const supabase = useSupabaseClient()
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .eq('tipo', tipo)
      .order('nombre', { ascending: true })
    if (error) throw new Error(error.message)
    return (data ?? []).map(cCat)
  },

  crear: async (item: any): Promise<Categoria> => {
    const supabase = useSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { data, error } = await supabase
      .from('categorias')
      .insert({
        usuario_id: user.id,
        nombre: item.nombre,
        tipo: item.tipo,
        color: item.color,
      })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return cCat(data)
  },

  eliminar: async (id: string): Promise<void> => {
    const supabase = useSupabaseClient()
    const { error } = await supabase.from('categorias').delete().eq('id', id)
    if (error) throw new Error(error.message)
  },
}

// ============ AJUSTES ============
export const ajustes = {
  obtener: async (_uid: string): Promise<Ajustes | null> => {
    const supabase = useSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('ajustes')
      .select('*')
      .eq('usuario_id', user.id)
      .maybeSingle()
    if (error) throw new Error(error.message)
    return data ? cAju(data) : null
  },

  actualizar: async (_id: string, cambios: Partial<Ajustes>): Promise<Ajustes> => {
    const supabase = useSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { data, error } = await supabase
      .from('ajustes')
      .update(cambios)
      .eq('usuario_id', user.id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return cAju(data)
  },
}