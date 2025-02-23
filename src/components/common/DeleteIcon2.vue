<template>
  <div
    v-if="node"
    class="delete-icon-container"
    :style="iconStyle"
    @click="handleDelete"
  >
    <img src="@/assets/images/icon_del.png" alt="Delete Node" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, CSSProperties } from 'vue'
import { LGraphNode } from '@comfyorg/litegraph'
import { app } from '@/scripts/app'
import { useCanvasStore } from '@/stores/graphStore'

const props = defineProps<{
  nodeId: number
}>()

const emit = defineEmits<{
  (e: 'delete-node', id: number): void
}>()

const canvasStore = useCanvasStore()
const node = ref<LGraphNode | null>(null)

const iconStyle = computed<CSSProperties>(() => {
  if (!node.value) return {}
  const scale = canvasStore.canvas?.ds?.scale ?? 1
  const width = node.value.width * scale
  const height = 20 * scale // Assuming icon size is 20px
  const [left, top] = app.canvasPosToClientPos(node.value.pos)

  return {
    left: `${left + width - height - 5 * scale}px`, // Adjust position
    top: `${top + 5 * scale}px`, // Adjust position
    width: `${height}px`,
    height: `${height}px`,
    position: 'absolute',
    zIndex: '999',
    cursor: 'pointer',
  }
})

const handleDelete = () => {
  // if (node.value) {
  //   app.graph.remove(node.value)
  //   emit('delete-node', props.nodeId)
  // }
}

onMounted(() => {
  node.value = app.graph.getNodeById(props.nodeId)
})
</script>

<style scoped>
.delete-icon-container img {
  width: 100%;
  height: 100%;
}
</style>
