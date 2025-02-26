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
      <img src="../../assets/images/icon_cm_del.png" alt="" @click="hideMenu" />
    </div>
    <ul>
      <li
        class="flex items-center"
        v-for="(item, index) in utilsNodes"
        :key="index"
        @click="handleClick(item)"
      >
        <div class="flex items-center">
          <img :src="item.icon" alt="" />
          <span>{{ item.name }}</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import {
  IContextMenuOptions,
  IContextMenuValue,
  LiteGraph,
  LiteGraphCanvasEvent
} from '@comfyorg/litegraph'
import type { Vector2 } from '@comfyorg/litegraph'
import { useEventListener } from '@vueuse/core'
import { computed, nextTick, onUnmounted, ref } from 'vue'

import { app as comfyApp } from '@/scripts/app'
import { useLitegraphService } from '@/services/litegraphService'
import { useCanvasStore } from '@/stores/graphStore'
import { ComfyNodeDefImpl, useNodeDefStore } from '@/stores/nodeDefStore'

const isVisible = ref(false)
const menuRef = ref<HTMLElement | null>(null)
const menuItems = ref<any[]>([])
const canvasStore = useCanvasStore()
const canvas = computed(() => canvasStore.canvas)
const nodeDefStore = useNodeDefStore()
const suggestions = ref<ComfyNodeDefImpl[]>([])
const triggerEvent = ref<LiteGraphCanvasEvent | null>(null)

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

// 适应屏幕
const adjustMenuPosition = (left, top) => {
  const menu = menuRef.value
  if (!menu) return { left: `${left}px`, top: `${top}px` }

  // 获取视窗大小
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  // 获取菜单大小
  const menuWidth = menu.offsetWidth
  const menuHeight = menu.offsetHeight

  // 调整水平位置
  let adjustedLeft = left
  if (left + menuWidth > viewportWidth) {
    adjustedLeft = left - menuWidth
  }
  adjustedLeft = Math.max(0, adjustedLeft) // 确保不超出左边界

  // 调整垂直位置
  let adjustedTop = top
  if (top + menuHeight > viewportHeight) {
    adjustedTop = top - menuHeight
  }
  adjustedTop = Math.max(0, adjustedTop) // 确保不超出上边界

  return {
    left: `${adjustedLeft}px`,
    top: `${adjustedTop}px`
  }
}
const OriginalContextMenu = LiteGraph.ContextMenu

interface CustomMouseEvent extends MouseEvent {
  canvasX?: number
  canvasY?: number
}

function ContextMenuCustom(
  values: (IContextMenuValue | string)[],
  options: IContextMenuOptions
) {
  const ctx = new OriginalContextMenu(values, options)
  const event = options.event as CustomMouseEvent
  const pos: Vector2 = [event.canvasX ?? 0, event.canvasY ?? 0]
  const [left, top] = comfyApp.canvasPosToClientPos(pos)

  positionStyle.value = {
    top: `${top}px`,
    left: `${left}px`
  }

  // 计算调整后的位置
  nextTick(() => {
    positionStyle.value = adjustMenuPosition(left, top)
  })

  // 显示菜单
  isVisible.value = true

  // 阻止默认右键菜单
  options.event?.preventDefault()
  return ctx
}

LiteGraph.ContextMenu =
  ContextMenuCustom as unknown as typeof LiteGraph.ContextMenu

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

useEventListener(window, 'resize', () => {
  if (isVisible.value && positionStyle.value) {
    const { left, top } = positionStyle.value
    // 获取当前位置的数值
    const curLeft = parseInt(left)
    const curTop = parseInt(top)
    // 重新调整位置
    positionStyle.value = adjustMenuPosition(curLeft, curTop)
  }
})

const utilsNodes = computed(() => {
  return [...nodeDefStore.utilsNodes]
})

/** 添加节点 */
const handleClick = (item) => {
  console.log(item)
  useLitegraphService().addNodeOnGraph(item)
  hideMenu()
}

onUnmounted(() => {
  hideMenu()
})
</script>

<style scoped>
.custom-context-menu {
  position: fixed;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  background: rgba(255, 255, 255, 0.5);
  width: 12rem;
  right: 30rem;
  top: 5rem;
  border-radius: 0.6rem;
  overflow: hidden;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
.custom-context-menu .rcm_title {
  height: 2.5rem;
  padding: 0 1rem;
  background: rgba(112, 162, 232, 0.5);
}
.custom-context-menu .rcm_title span {
  font-size: 0.8rem;
  color: #111;
  font-weight: bold;
}
.custom-context-menu .rcm_title img {
  width: 1.58rem;
  height: 1.58rem;
  cursor: pointer;
}
.custom-context-menu ul {
  list-style-type: none;
  margin: 0;
  padding: 0.5rem;
}

.custom-context-menu li {
  cursor: pointer;
  height: 2rem;
  padding: 0 0.5rem;
}
.custom-context-menu li.bot {
  border-bottom: solid 1px rgba(24, 103, 211, 1);
  margin-bottom: 0.3rem;
  padding-bottom: 0.3rem;
}
.custom-context-menu li img {
  width: 1.5rem;
  height: 1.5rem;
  object-fit: contain;
}
.custom-context-menu li span {
  font-size: 0.8rem;
  color: rgb(51, 51, 51);
  padding-left: 1rem;
}
/*.custom-context-menu li:hover {
  background-color: rgba(255, 255, 255, .58);
  border-radius: .5rem;
}*/
</style>
