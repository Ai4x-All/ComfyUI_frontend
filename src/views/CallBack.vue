<template>
  <BaseViewTemplate dark>
    <div class="flex flex-col items-center justify-center gap-8 p-8">
      <h1 class="animated-gradient-text text-glow select-none">加载中...</h1>
    </div>
  </BaseViewTemplate>
</template>

<script setup lang="ts">
import { UserManager } from 'oidc-client-ts'
import { onMounted } from 'vue'

import router from '@/router'
import { api } from '@/scripts/api'
// import Oidc from "oidc-client";
import oidcConfig from '@/scripts/oauthClient'

onMounted(() => {
  // let userManager = new Oidc.UserManager(oidcConfig);
  const userManager = new UserManager(oidcConfig)
  userManager
    .signinRedirectCallback()
    .then(
      () => {
        userManager.getUser().then((user) => {
          console.log('user', user)
          if (user) {
            localStorage.setItem('userInfo', JSON.stringify(user))
            // localStorage.setItem('token', user.access_token);
            api.setToken(user.access_token)
            router.replace('/')
          } else {
            userManager.signinRedirect()
          }
        })
      },
      () => {
        userManager.signinRedirect()
      }
    )
    .catch(function (e) {
      console.error('CallBack 错误信息' + e)
    })
})
</script>

<style scoped>
.animated-gradient-text {
  @apply font-bold;
  font-size: clamp(2rem, 8vw, 4rem);
  background: linear-gradient(to right, #12c2e9, #c471ed, #f64f59, #12c2e9);
  background-size: 300% auto;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradient 8s linear infinite;
}

.text-glow {
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.3));
}

@keyframes gradient {
  0% {
    background-position: 0% center;
  }

  100% {
    background-position: 300% center;
  }
}

.fade-in-up {
  animation: fadeInUp 1.5s ease-out;
  animation-fill-mode: both;
}

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
