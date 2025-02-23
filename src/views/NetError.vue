<template>
  <BaseViewTemplate dark>
    <div class="flex flex-col items-center justify-center gap-8 p-8">
      <!--<ActionbarCustom />-->
      <!-- Header -->
      <h1 class="animated-gradient-text text-glow select-none">网络错误</h1>

      <!-- Get Started Button -->
      <Button
        label="刷新重试"
        icon="pi pi-arrow-right"
        iconPos="right"
        size="large"
        rounded
        @click="handleRefresh"
        class="p-4 text-lg fade-in-up"
      />
    </div>
  </BaseViewTemplate>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import ActionbarCustom from "../components/actionbarCustom/ComfyActionbar.vue"
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
const router = useRouter()
const userStore = useUserStore()

function handleRefresh() {
  const users = userStore.users;
  router.replace('/')

  // if (users && users.length) {
  //   userStore.login({ userId: users[0].userId, username: users[0].username })
  //   router.replace('/')
  // }
}
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
