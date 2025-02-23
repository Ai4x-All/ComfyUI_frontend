<template>
  <div class="node_add_icon" @click="handleClick" v-tooltip.bottom="{ value: '清除工作流', showDelay: 300 }">
    <img :src="delIcon" alt="">
  </div>
</template>

<script setup lang="ts">
import { useCommandStore } from '@/stores/commandStore'
import delIcon from "@/assets/images/icon_bar_del.png"

const commandStore = useCommandStore()

// 清除工作流
const handleClick = ()=> {
  commandStore.execute('Comfy.ClearWorkflow')
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
