import { defineNuxtRouteMiddleware, navigateTo } from '#app'
import type { RouteLocationNormalized } from 'vue-router'
import { auth } from '~/database'

export default defineNuxtRouteMiddleware(async (to: RouteLocationNormalized) => {
  const usuario = await auth.usuarioActual()
  const rutasPublicas = ['/login', '/registro']

  if (!usuario && !rutasPublicas.includes(to.path)) {
    return navigateTo('/login')
  }
  if (usuario && rutasPublicas.includes(to.path)) {
    return navigateTo('/')
  }
})