<!--:style="positionStyle" v-if="isVisible" -->
<template>
  <div
    ref="menuRef"
    class="custom-context-menu"
    @contextmenu.prevent
    :style="positionStyle"
    v-if="isVisible"
  >
    <div class="rcm_title flex justify-between items-center">
      <span>添加节点</span>
      <img src="../../assets/images/icon_cm_del.png" alt="" />
    </div>
    <ul>
      <li
        v-for="(item, index) in menuItems"
        :key="index"
        @click="handleMenuItemClick(item)"
      >
        {{ item.content }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { LiteGraph } from '@comfyorg/litegraph'
import type { Vector2 } from '@comfyorg/litegraph'
import { useEventListener } from '@vueuse/core'
import { computed, onUnmounted, ref } from 'vue'

import { app as comfyApp } from '@/scripts/app'
import { useCanvasStore } from '@/stores/graphStore'

const isVisible = ref(false)
const menuRef = ref<HTMLElement | null>(null)
const menuItems = ref<any[]>([])
const canvasStore = useCanvasStore()
const canvas = computed(() => canvasStore.canvas)

const positionStyle = ref({
  top: '0px',
  left: '0px'
})

const handleMenuItemClick = (item: any) => {
  isVisible.value = false
}

const hideMenu = () => {
  isVisible.value = false
}

// 获取画布菜单选项
const getCanvasMenuOptions = () => {
  if (!canvas.value) return []
  const options = canvas.value.getCanvasMenuOptions()
  console.log(options)
  return options
}

// @ts-expect-error 重写 LiteGraph.ContextMenu 自定义右键菜单
LiteGraph.ContextMenu = function (
  values,
  options,
  root,
  current_submenu,
  lock
) {
  const pos: Vector2 = [options.event?.canvasX, options.event?.canvasY]
  const [left, top] = comfyApp.canvasPosToClientPos(pos)

  positionStyle.value = {
    top: `${top}px`,
    left: `${left}px`
  }

  // 更新菜单项
  /*menuItems.value = values.map((item: any) => ({
    content: item.content || item.title,
    callback: item.callback
  }))*/

  // 显示菜单
  isVisible.value = true

  // 阻止默认右键菜单
  options.event?.preventDefault()

  // 防止默认的右键菜单弹出
  /*document.addEventListener('contextmenu', (event) => {
    event.preventDefault();
  });*/
}

/*onUnmounted(() => {
  document.removeEventListener('contextmenu', () => {})
})*/

// 处理鼠标左键点击事件
useEventListener(document, 'click', (event) => {
  // 如果点击的不是菜单内部，则隐藏菜单
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    hideMenu()
  }
})

// 鼠标移出画布事件
useEventListener(document, 'mouseleave', () => {
  hideMenu()
})

// 全局右键事件处理
useEventListener(document, 'contextmenu', (event) => {
  // 如果不是在画布上右键，则隐藏菜单
  // const canvasElement = canvas.value?.$el
  /*const canvasElement = canvas.value
  if (canvasElement && !canvasElement.contains(event.target as Node)) {
    hideMenu()
  }*/
})

onUnmounted(() => {
  // 清理事件监听
  hideMenu()
})
</script>

<style scoped>
.custom-context-menu {
  position: fixed;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  background: rgba(255, 255, 255, 0.5);
  width: 9rem;
  right: 30rem;
  top: 5rem;
  border-radius: 8px;
  overflow: hidden;
  /*backdrop-filter: blur(10px);*/
  /*-webkit-backdrop-filter: blur(10px);*/
}
.custom-context-menu .rcm_title {
  background: rgba(112, 162, 232, 0.5);
}
.custom-context-menu .rcm_title span {
  font-size: 1rem;
  color: #333;
  font-weight: bold;
}
.custom-context-menu .rcm_title img {
  width: 2rem;
  height: 2rem;
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
