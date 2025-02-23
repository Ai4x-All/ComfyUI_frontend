<template>
  <div class="node_add_icon flex items-center justify-center">
    <i class="pi pi-bars text-xl" @click="handleFocusMode" v-tooltip.bottom="{ value: '隐藏菜单', showDelay: 300 }" />
  </div>
</template>

<script setup lang="ts">
import { useWorkspaceStore } from '@/stores/workspaceStore'

const workspaceState = useWorkspaceStore()
function handleFocusMode() {
  workspaceState.focusMode = true
}
</script>

<style scoped>
.node_add_icon {
  cursor: pointer;
  height: 2.8rem;
  padding-left: 0.45rem;
}
.node_add_icon i {
  color: rgba(51, 51, 51);
}
</style>

