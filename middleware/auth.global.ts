import { defineNuxtRouteMiddleware, navigateTo } from '#app'
import type { RouteLocationNormalized } from 'vue-router'
import { auth } from '~/database'

export default defineNuxtRouteMiddleware(async (to: RouteLocationNormalized) => {
  const usuario = await auth.usuarioActual()
  const publicas = ['/login', '/registro']

  if (!usuario && !publicas.includes(to.path)) {
    return navigateTo('/login')
  }
  if (usuario && publicas.includes(to.path)) {
    return navigateTo('/')
  }
})