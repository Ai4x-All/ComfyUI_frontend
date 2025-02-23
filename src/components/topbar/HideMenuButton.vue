<template>
  <Button
    icon="pi pi-bars"
    severity="secondary"
    text
    :aria-label="$t('menu.hideMenu')"
    @click="handleFocusMode"
    v-tooltip.bottom="{ value: $t('menu.hideMenu'), showDelay: 300 }"
  />
</template>

<script setup lang="ts">
import Button from 'primevue/button'

import { useWorkspaceStore } from '@/stores/workspaceStore'

const workspaceState = useWorkspaceStore()
function handleFocusMode() {
  // document.getElementById('comfyui-body-float').style.display = 'none'
  workspaceState.focusMode = true
}
</script>
