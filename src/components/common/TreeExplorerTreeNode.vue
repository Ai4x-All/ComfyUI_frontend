<template>
  <div
    :class="[
      'tree-node',
      {
        'can-drop': canDrop,
        'tree-folder': !props.node.leaf,
        'tree-leaf': props.node.leaf
      }
    ]"
    ref="container"
  >
    <div class="node-content">
      <span class="node-label">
        <slot name="before-label" :node="props.node"></slot>
        <EditableText
          :modelValue="node.label"
          :isEditing="isEditing"
          @edit="handleRename"
        />
        <slot name="after-label" :node="props.node"></slot>
      </span>
      <Badge
        v-if="showNodeBadgeText"
        :value="nodeBadgeText"
        severity="secondary"
        class="leaf-count-badge"
      />
    </div>
    <div
      class="node-actions motion-safe:opacity-0 motion-safe:group-hover/tree-node:opacity-100"
    >
      <slot name="actions" :node="props.node"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview'
import Badge from 'primevue/badge'
import { Ref, computed, inject, ref } from 'vue'

import EditableText from '@/components/common/EditableText.vue'
import { useErrorHandling } from '@/composables/useErrorHandling'
import {
  usePragmaticDraggable,
  usePragmaticDroppable
} from '@/composables/usePragmaticDragAndDrop'
import type {
  RenderedTreeExplorerNode,
  TreeExplorerDragAndDropData,
  TreeExplorerNode
} from '@/types/treeExplorerTypes'

const props = defineProps<{
  node: RenderedTreeExplorerNode
}>()

const emit = defineEmits<{
  (
    e: 'itemDropped',
    node: RenderedTreeExplorerNode,
    data: RenderedTreeExplorerNode
  ): void
  (e: 'dragStart', node: RenderedTreeExplorerNode): void
  (e: 'dragEnd', node: RenderedTreeExplorerNode): void
}>()

const nodeBadgeText = computed<string>(() => {
  if (props.node.leaf) {
    return ''
  }
  if (props.node.badgeText !== undefined && props.node.badgeText !== null) {
    return props.node.badgeText
  }
  return props.node.totalLeaves.toString()
})
const showNodeBadgeText = computed<boolean>(() => nodeBadgeText.value !== '')

const labelEditable = computed<boolean>(() => !!props.node.handleRename)
const renameEditingNode =
  inject<Ref<TreeExplorerNode | null>>('renameEditingNode')
const isEditing = computed(
  () => labelEditable.value && renameEditingNode.value?.key === props.node.key
)
const errorHandling = useErrorHandling()
const handleRename = errorHandling.wrapWithErrorHandlingAsync(
  async (newName: string) => {
    await props.node.handleRename(newName)
  },
  props.node.handleError,
  () => {
    renameEditingNode.value = null
  }
)
const container = ref<HTMLElement | null>(null)
const canDrop = ref(false)

const treeNodeElementGetter = () =>
  container.value?.closest('.p-tree-node-content') as HTMLElement

if (props.node.draggable) {
  usePragmaticDraggable(treeNodeElementGetter, {
    getInitialData: () => {
      return {
        type: 'tree-explorer-node',
        data: props.node
      }
    },
    onDragStart: () => emit('dragStart', props.node),
    onDrop: () => emit('dragEnd', props.node),
    onGenerateDragPreview: props.node.renderDragPreview
      ? ({ nativeSetDragImage }) => {
          setCustomNativeDragPreview({
            render: ({ container }) => {
              return props.node.renderDragPreview(container)
            },
            nativeSetDragImage
          })
        }
      : undefined
  })
}

if (props.node.droppable) {
  usePragmaticDroppable(treeNodeElementGetter, {
    onDrop: async (event) => {
      const dndData = event.source.data as TreeExplorerDragAndDropData
      if (dndData.type === 'tree-explorer-node') {
        await props.node.handleDrop?.(dndData)
        canDrop.value = false
        emit('itemDropped', props.node, dndData.data)
      }
    },
    onDragEnter: (event) => {
      const dndData = event.source.data as TreeExplorerDragAndDropData
      if (dndData.type === 'tree-explorer-node') {
        canDrop.value = true
      }
    },
    onDragLeave: () => {
      canDrop.value = false
    }
  })
}
</script>

<style scoped>
.tree-node {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.leaf-count-badge {
  margin-left: 0.5rem;
}
.node-content {
  display: flex;
  align-items: center;
  flex-grow: 1;
}
.leaf-label {
  margin-left: 0.5rem;
}
:deep(.editable-text span) {
  word-break: break-all;
}
/* updateCustom */
.tree-node {
  color: var(--custom-node-label-color);
}
</style>
