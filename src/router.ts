// @ts-strict-ignore
// import Oidc from "oidc-client-ts";
import { UserManager } from 'oidc-client-ts'
import {
  NavigationGuardNext,
  RouteLocationNormalized,
  createRouter,
  createWebHashHistory,
  createWebHistory
} from 'vue-router'

import LayoutDefault from '@/views/layouts/LayoutDefault.vue'

import oidcConfig from './scripts/oauthClient'
import { isElectron } from './utils/envUtil'

const isFileProtocol = window.location.protocol === 'file:'
const basePath = '/' // isElectron() ? '/' : window.location.pathname

const guardElectronAccess = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  if (isElectron()) {
    next()
  } else {
    next('/')
  }
}

const router = createRouter({
  history: isFileProtocol
    ? createWebHashHistory()
    : // Base path must be specified to ensure correct relative paths
      // Example: For URL 'http://localhost:7801/ComfyBackendDirect',
      // we need this base path or assets will incorrectly resolve from 'http://localhost:7801/'
      createWebHistory(basePath),
  routes: [
    {
      path: '/',
      component: LayoutDefault,
      children: [
        {
          path: '',
          name: 'GraphView',
          component: () => import('@/views/GraphView.vue')
          // beforeEnter: async (to, from, next) => {
          //   next()
          //   /*try {
          //     const userStore = useUserStore()
          //     await userStore.initialize()
          //     if (userStore.needsLogin) {
          //       next('/404')
          //       // next('/user-select')
          //     } else {
          //       next()
          //     }
          //   }catch (error) {
          //     if (to.path !== '/error') {
          //       next('/error')
          //     } else {
          //       next('/error')
          //     }
          //   }*/
          // }
        },
        {
          path: 'user-select',
          name: 'UserSelectView',
          component: () => import('@/views/UserSelectView.vue')
        },
        {
          path: 'server-start',
          name: 'ServerStartView',
          component: () => import('@/views/ServerStartView.vue'),
          beforeEnter: guardElectronAccess
        },
        {
          path: 'install',
          name: 'InstallView',
          component: () => import('@/views/InstallView.vue'),
          beforeEnter: guardElectronAccess
        },
        {
          path: 'welcome',
          name: 'WelcomeView',
          component: () => import('@/views/WelcomeView.vue'),
          beforeEnter: guardElectronAccess
        },
        {
          path: 'not-supported',
          name: 'NotSupportedView',
          component: () => import('@/views/NotSupportedView.vue'),
          beforeEnter: guardElectronAccess
        },
        {
          path: 'download-git',
          name: 'DownloadGitView',
          component: () => import('@/views/DownloadGitView.vue'),
          beforeEnter: guardElectronAccess
        },
        {
          path: 'manual-configuration',
          name: 'ManualConfigurationView',
          component: () => import('@/views/ManualConfigurationView.vue'),
          beforeEnter: guardElectronAccess
        },
        {
          path: '/metrics-consent',
          name: 'MetricsConsentView',
          component: () => import('@/views/MetricsConsentView.vue'),
          beforeEnter: guardElectronAccess
        },
        {
          path: 'desktop-start',
          name: 'DesktopStartView',
          component: () => import('@/views/DesktopStartView.vue'),
          beforeEnter: guardElectronAccess
        },
        {
          path: 'maintenance',
          name: 'MaintenanceView',
          component: () => import('@/views/MaintenanceView.vue'),
          beforeEnter: guardElectronAccess
        },
        {
          path: 'desktop-update',
          name: 'DesktopUpdateView',
          component: () => import('@/views/DesktopUpdateView.vue'),
          beforeEnter: guardElectronAccess
        }
      ]
    },
    {
      path: '/callback',
      name: 'CallBack',
      component: () => import('@/views/CallBack.vue')
    },
    {
      path: '/NetError',
      name: 'NetError',
      component: () => import('@/views/NetError.vue')
    }
  ],

  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

router.beforeEach((to, from, next) => {
  next()
  return
  if (localStorage.getItem('token') || to.path == '/callback') {
    next()
  } else {
    const mgr = new UserManager(oidcConfig)
    mgr.signinRedirect()
  }
})

export default router
