import { defineStore } from 'pinia'
import { computed, ref, watchEffect } from 'vue'

import { api } from '@/scripts/api'
import type { User as UserConfig } from '@/types/apiTypes'

export interface User {
  userId: string
  username: string
}

export const useUserStore = defineStore('user', () => {
  /**
   * The user config. null if not loaded.
   */
  const userConfig = ref<UserConfig | null>(null)
  /**
   * The current user id. null if not logged in or in single user mode.
   */
  const currentUserId = ref<string | null>(null)

  const isCollapsed = ref(localStorage.getItem('Comfy.isCollapsed') === 'true')

  const isMultiUserServer = computed(
    () => userConfig.value && 'users' in userConfig.value
  )
  const needsLogin = computed(
    () => !currentUserId.value && isMultiUserServer.value
  )

  const users = computed<User[]>(() =>
    Object.entries(userConfig.value?.users ?? {}).map(([userId, username]) => ({
      userId,
      username
    }))
  )
  const currentUser = computed<User | null>(
    () =>
      users.value.find((user) => user.userId === currentUserId.value) ?? null
  )
  const initialized = computed(() => userConfig.value !== null)

  /**
   * Initialize the user store. updateCustom
   */
  async function initialize() {
    const data = await api.getUserConfig()

    userConfig.value = data
    currentUserId.value = localStorage['Comfy.userId']
    const users = Object.entries(data?.users ?? {}).map(
      ([userId, username]) => ({
        userId,
        username
      })
    )

    if (users && users.length) {
      await login({ userId: users[0].userId, username: users[0].username })
    }
  }

  /**
   * Create a new user.
   *
   * @param username - The username.
   * @returns The new user.
   */
  async function createUser(username: string): Promise<User> {
    const resp = await api.createUser(username)
    const data = await resp.json()
    if (resp.status >= 300) {
      throw new Error(
        data.error ??
          'Error creating user: ' + resp.status + ' ' + resp.statusText
      )
    }
    return {
      userId: data,
      username
    }
  }

  /**
   * Login the current user.
   *
   * @param user - The user.
   */
  async function login({
    userId,
    username
  }: {
    userId: string
    username: string
  }) {
    currentUserId.value = userId
    localStorage['Comfy.userId'] = userId
    localStorage['Comfy.userName'] = username
  }

  watchEffect(() => {
    if (isMultiUserServer.value && currentUserId.value) {
      api.user = currentUserId.value
    }
  })

  /**
   * Logout the current user.
   */
  async function logout() {
    delete localStorage['Comfy.userId']
    delete localStorage['Comfy.userName']
  }

  // 更新 isCollapsed
  function setIsCollapsed(value: boolean) {
    isCollapsed.value = value
    localStorage.setItem('Comfy.isCollapsed', value.toString())
  }

  return {
    users,
    currentUser,
    isMultiUserServer,
    needsLogin,
    initialized,
    initialize,
    createUser,
    login,
    logout,
    isCollapsed,
    setIsCollapsed
  }
})
