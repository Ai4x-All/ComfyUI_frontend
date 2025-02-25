<template>
  <div ref="menuRef" class="custom-context-menu" :style="positionStyle" v-if="isVisible">
    <ul>
      <li v-for="(item, index) in menuItems" :key="index" @click="handleMenuItemClick(item)">
        {{ item.content }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, onUnmounted, nextTick, watchEffect } from 'vue'
import { useEventListener } from "@vueuse/core"
import { useCanvasStore } from '@/stores/graphStore'
import { LGraphCanvas, LiteGraph } from '@comfyorg/litegraph'
import { app as comfyApp } from '@/scripts/app'

const isVisible = ref(false)
const menuRef = ref<HTMLElement | null>(null)
const menuItems = ref<any[]>([])
const canvasStore = useCanvasStore()
const canvas = computed(() => canvasStore.canvas)
const positionStyle = ref(null)

const handleMenuItemClick = (item: any) => {
  isVisible.value = false
}

// 获取画布菜单选项
const getCanvasMenuOptions = () => {
  if (!canvas.value) return []
  const options = canvas.value.getCanvasMenuOptions()
  console.log(options)
  return options
}

LiteGraph.ContextMenu = function (values, options, root, current_submenu, lock) {
  console.log(options.event)
  const pos = [options.event?.canvasX, options.event?.canvasY]
  const [left, top] = comfyApp.canvasPosToClientPos(pos)

  positionStyle.value = {
    top: `${top}px`,
    left: `${left}px`
  }

  // 显示菜单
  isVisible.value = true;

  // 防止默认的右键菜单弹出
  document.addEventListener('contextmenu', (event) => {
    event.preventDefault();
  });
};

onUnmounted(() => {
  document.removeEventListener('contextmenu', () => {})
})
</script>

<style scoped>
.custom-context-menu {
  position: fixed;
  background-color: white;
  border: 1px solid #ccc;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  padding: 5px 0;
  min-width: 150px;
}

.custom-context-menu ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.custom-context-menu li {
  padding: 8px 16px;
  cursor: pointer;
}

.custom-context-menu li:hover {
  background-color: #f0f0f0;
}
</style>
