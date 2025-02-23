<template>
  <div ref="dragHandleRef" @mousedown.stop class="node_add_icon" v-tooltip.bottom="{ value: '拖拽', showDelay: 300 }">
    <img :src="SendIcon" @dragstart.prevent alt="">
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SendIcon from "@/assets/images/icon_bar_send.png"

const dragHandleRef = ref<HTMLElement | null>(null)
defineExpose({ dragHandleRef })
</script>

<style scoped>
.node_add_icon {
  cursor: pointer;
  height: 2.8rem;
  padding-left: 0.45rem;
}
.node_add_icon img {
  display: block;
  height: 2.8rem;
  object-fit: contain;
}
</style>
