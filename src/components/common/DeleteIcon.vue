<template>
  <img class="del_icon" src="@/assets/images/icon_del.png" @click="handleDelete" />
</template>

<script setup lang="ts">
// import { defineProps, defineEmits } from 'vue'

const props = defineProps<{
  nodeId: number
}>()

const $emit = defineEmits<{
  (e: 'delete-node', id: number): void
}>()

const handleDelete = () => {
  $emit('delete-node', props.nodeId)
}
</script>

<style scoped>
  .del_icon {
    display: block;
    width: 100%;
    height: 100%
  }
</style>
