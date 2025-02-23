<template>
  <div class="node_add_icon" @click="handleClick" v-tooltip.bottom="{ value: '缩略图', showDelay: 300 }">
    <img :src="ThumbIcon" alt="">
  </div>
</template>

<script setup lang="ts">
import ThumbIcon from "@/assets/images/icon_bar_thumb.png"
import { ref } from 'vue'

const emit = defineEmits(['toggle'])
const buttonRef = ref<HTMLElement | null>(null)

const handleClick = () => {
  emit('toggle', buttonRef.value?.offsetLeft || 0)
}
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
