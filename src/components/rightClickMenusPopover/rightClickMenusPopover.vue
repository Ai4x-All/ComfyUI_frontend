<template>
  <div  ref="menuRef" class="custom-context-menu">
    <ul>
      <li v-for="(item, index) in menuItems" :key="index" @click="handleMenuItemClick(item)">
        {{ item.content }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, onUnmounted, nextTick, watchEffect } from 'vue'
import { useCanvasStore } from '@/stores/graphStore'
import { LGraphCanvas, LiteGraph } from '@comfyorg/litegraph'
import { useContextMenuTranslation } from '@/composables/useContextMenuTranslation'

const isVisible = ref(false)
const menuRef = ref<HTMLElement | null>(null)
const menuItems = ref<any[]>([])
const canvasStore = useCanvasStore()
const canvas = computed(() => canvasStore.canvas)

const handleMenuItemClick = (item: any) => {
  if (item.action) {
    item.action()
  }
  isVisible.value = false
}

const showMenu = (event: MouseEvent, items: any[]) => {
  event.preventDefault()
  menuItems.value = items
  isVisible.value = true
  nextTick(() => {
    if (menuRef.value) {
      menuRef.value.style.left = `${event.clientX}px`
      menuRef.value.style.top = `${event.clientY}px`
    }
  })
}

const hideMenu = () => {
  isVisible.value = false
}

watchEffect(() => {
  if (canvasStore.canvas) {
    LiteGraph.release_link_on_empty_shows_menu = false
    canvasStore.canvas.allow_searchbox = false
  }
})

onMounted(() => {
  document.addEventListener('click', hideMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', hideMenu)
})

// 监听 canvas 的右键点击事件
watch(canvas, (newCanvas) => {
  if (newCanvas) {
    // newCanvas.canvas.addEventListener('contextmenu', (event: MouseEvent) => {
    //   const items = getCanvasMenuOptions()
    //   showMenu(event, items)
    // })
  }
})

const getCanvasMenuOptions = () => {
  if (!canvas.value) return []
  const options = canvas.value.getCanvasMenuOptions()
  console.log(options)

  return options
}
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
