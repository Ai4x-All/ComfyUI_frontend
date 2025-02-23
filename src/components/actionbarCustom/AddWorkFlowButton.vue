<template>
  <div class="node_add_icon" @click="handleClick" v-tooltip.bottom="{ value: '新建画布', showDelay: 300 }">
    <img :src="AddIcon" alt="">
  </div>
</template>

<script setup lang="ts">
import { useCommandStore } from '@/stores/commandStore'
import AddIcon from "@/assets/images/icon_bar_add.png"

const commandStore = useCommandStore()

// 新建画布
const handleClick = ()=> {
  commandStore.execute('Comfy.NewBlankWorkflow')
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
