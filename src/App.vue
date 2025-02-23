<template>
  <router-view />
  <ProgressSpinner
    v-if="isLoading"
    class="absolute inset-0 flex justify-center items-center h-screen"
  />
  <GlobalDialog />
  <BlockUI full-screen :blocked="isLoading" />
</template>

<script setup lang="ts">
import { useEventListener } from '@vueuse/core'
import BlockUI from 'primevue/blockui'
import ProgressSpinner from 'primevue/progressspinner'
import { computed, onMounted } from 'vue'

import GlobalDialog from '@/components/dialog/GlobalDialog.vue'
import config from '@/config'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { api } from '@/scripts/api'

import { electronAPI, isElectron } from './utils/envUtil'

const workspaceStore = useWorkspaceStore()
const isLoading = computed<boolean>(() => workspaceStore.spinner)
const handleKey = (e: KeyboardEvent) => {
  workspaceStore.shiftDown = e.shiftKey
}
useEventListener(window, 'keydown', handleKey)
useEventListener(window, 'keyup', handleKey)

const showContextMenu = (event: PointerEvent) => {
  const { target } = event
  switch (true) {
    case target instanceof HTMLTextAreaElement:
    case target instanceof HTMLInputElement && target.type === 'text':
      // TODO: Context input menu explicitly for text input
      electronAPI()?.showContextMenu({ type: 'text' })
      return
  }
}

onMounted(() => {
  window['__COMFYUI_FRONTEND_VERSION__'] = config.app_version
  console.log('ComfyUI Front-end version:', config.app_version)

  if (isElectron()) {
    document.addEventListener('contextmenu', showContextMenu)
  }

  // 获取 iframe 元素
  // const iframe = document.getElementById('comfyui-iframe');

  // 发送 token 到 iframe
  // iframe.contentWindow.postMessage({ type: 'SET_TOKEN', token, userId }, 'https://wb.agent4x.org/');

  api.setToken('eyJhbGciOiJSUzI1NiIsImtpZCI6IjYzMDhFNTQ2OTQ0QjZCRDlFOEU1NkExRTBFQjM4NEJGQjBBNUJGRTAiLCJ4NXQiOiJZd2psUnBSTGE5bm81V29lRHJPRXY3Q2x2LUEiLCJ0eXAiOiJhdCtqd3QifQ.eyJpc3MiOiJodHRwczovL2lkZW50aXR5LmFnZW50NHgub3JnLyIsImV4cCI6MTczOTk1MzYxNywiaWF0IjoxNzM5OTUwMDE3LCJhdWQiOiJyc19kYXRhRXZlbnRSZWNvcmRzQXBpIiwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCBkYXRhRXZlbnRSZWNvcmRzIG9mZmxpbmVfYWNjZXNzIiwianRpIjoiM2M4YWZjNWUtNGM0Yy00N2I0LTliNjYtYTFiZDE0OWFkMjI2Iiwic3ViIjoiOTlkZWM4NmItMzhhNS00NzNkLWJhNmYtZjI2ODk3YzMyMWZkIiwibmFtZSI6IjE3NjAwMjIzNzg2IiwiZW1haWwiOiIxNzYwMDIyMzc4NkBsb2NhbCIsIlROVCI6IkZGN0Y0Q0MyNjkxMjRDNjc4NzMyQ0RDOEM5OUJCQTMxIiwib2lfcHJzdCI6IndvcmtiZW5jaGFwcCIsIm9pX2F1X2lkIjoiZjBjZTZhYWItMTFkMy00N2ZjLWE0YjAtZDcwMzcxNzgzMzYxIiwiY2xpZW50X2lkIjoid29ya2JlbmNoYXBwIiwib2lfdGtuX2lkIjoiODA5YTU2NWQtZmUyYS00NGM5LTlmMTgtMGZjZjg5Y2M2YTAwIn0.bwE4zqDtNNNEip3kP2y304e3Bx5cHaDRniPWyZnM5a46sab9Mtk7r_666U7ztwdA1h7e3bPHdMYmL3Wynl2SVJ90xyABW4VbBqxgxbCiO_Bqt2fvEle31-l1jA4-N08TARuSxpwevLHkfIMg8mEQ9N_sKSocOYRYa3nccELQb1PbzNJR75S3oDsp38cdcSjKEo5GkflEhmmHaM2STK9ZlF62A36JyyTLGh-pULfCWBkGyUBmnvoaIxO-1gQYZjn8q5WSD1_ek5FiL4HSg2zUnyOKDKaS7yFpRo6M6x4btQe4PnH8Octm2R6j9C5U4o2tTMpp3ZK0csQqEFyM63d9zQ')

  // 添加监听
  window.addEventListener('message', (event) => {
    if (event.origin !== 'https://wb.agent4x.org/') {
      return;
    }
    const { type, token, userId } = event.data;
    if (type === 'SET_TOKEN') {
      api.setToken(token);
    }
  });
})
</script>
