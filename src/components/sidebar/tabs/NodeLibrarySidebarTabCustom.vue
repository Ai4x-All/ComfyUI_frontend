<template>
  <SidebarTabTemplate
    :title="$t('sideToolbar.nodeLibrary')"
    class="bg-[var(--p-tree-background)]"
  >
    <template #body>
      <div class="custom-context-menu">
        <!--<ul>
          <li
            class="flex items-center"
            :class="item.bot && 'bot'"
            v-for="(item, index) in renderedRoot.children[0].children"
            key="index"
            @click="handleClick(item)">
            <div class="flex items-center">
              <img :src="item.icon" alt="" />
              <span>{{ item.content }}{{ item.display_name }} {{ item.label }}</span>
            </div>
          </li>
        </ul>-->

        <div class="utils-nodes">
          <ul>
            <li
              class="flex items-center"
              v-for="(nodeDef, index) in utilsNodes"
              :key="index"
              @click="handleClick(nodeDef)"
            >
              <div class="flex items-center">
                <img :src="formatIcon(nodeDef)" alt="" />
                <span>{{ getDisplayName(nodeDef) }}</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </template>
  </SidebarTabTemplate>
  <div id="node-library-node-preview-container" />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import { useLitegraphService } from '@/services/litegraphService'
import {
  ComfyNodeDefImpl,
  useNodeDefStore,
  useNodeFrequencyStore
} from '@/stores/nodeDefStore'
import type { TreeExplorerNode } from '@/types/treeExplorerTypes'
import formatIcon from '@/utils/format'

const nodeDefStore = useNodeDefStore()
const nodeFrequencyStore = useNodeFrequencyStore()

const menuItems = ref<any[]>([])
interface NodeItem {
  id: number
  type: string
  icon: string
  name: string
  display_name?: string
  bot?: boolean
}

/** 返回的所有节点 tree item.data */
const root = computed(() => {
  return nodeDefStore.nodeTree
})

/** 返回接口返回节点数组 item */
const suggestions = computed(() => {
  return nodeFrequencyStore.topNodeDefs
})

const utilsNodes = computed<NodeItem[]>(() => {
  return nodeDefStore.utilsNodes as NodeItem[]
})

const getDisplayName = (item: NodeItem): string => {
  return item.display_name || item.name
}

/** renderedRoot.children[0].children item.data */
const renderedRoot = computed<TreeExplorerNode<ComfyNodeDefImpl>>(() => {
  const fillNodeInfo = (node) => {
    const children = node.children?.map(fillNodeInfo)

    return {
      key: node.key,
      label: node.leaf ? node.data.display_name : node.label,
      leaf: node.leaf,
      data: node.data,
      children
    }
  }
  return fillNodeInfo(root.value)
})

/** 添加节点 */
const handleClick = (item) => {
  console.log(item)
  useLitegraphService().addNodeOnGraph(item)
}
</script>
<style scoped>
.custom-context-menu ul {
  list-style-type: none;
  margin: 0;
  padding: 0.5rem;
}

.custom-context-menu li {
  cursor: pointer;
  height: 2.5rem;
  padding: 0 0.5rem;
}
.custom-context-menu li.bot {
  border-bottom: solid 1px rgba(24, 103, 211, 1);
  margin-bottom: 0.3rem;
  padding-bottom: 0.3rem;
}
.custom-context-menu li img {
  width: 1.8rem;
  height: 1.8rem;
  object-fit: contain;
}
.custom-context-menu li span {
  font-size: 1rem;
  color: rgb(51, 51, 51);
  padding-left: 1rem;
}
</style>
