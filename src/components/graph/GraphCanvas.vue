<template>
  <!-- Load splitter overlay only after comfyApp is ready. -->
  <!-- If load immediately, the top-level splitter stateKey won't be correctly
  synced with the stateStorage (localStorage). -->
  <LiteGraphCanvasSplitterOverlay
    v-if="comfyAppReady && betaMenuEnabled && !workspaceStore.focusMode"
  >
    <template #side-bar-panel>
      <SideToolbar v-if="sidebarLocation !== 'float'" />
    </template>
    <template #bottom-panel>
      <BottomPanel />
    </template>
    <template #graph-canvas-panel>
      <SecondRowWorkflowTabs
        v-if="
          workflowTabsPosition === 'Topbar (2nd-row)' &&
          sidebarLocation !== 'float'
        "
        class="pointer-events-auto"
      />
      <GraphCanvasMenu v-if="canvasMenuEnabled" class="pointer-events-auto" />
    </template>
  </LiteGraphCanvasSplitterOverlay>

  <div
    v-if="
      comfyAppReady &&
      betaMenuEnabled &&
      !workspaceStore.focusMode &&
      sidebarLocation === 'float'
    "
  >
    <SideToolbarCustom />
  </div>

  <TitleEditor />
  <GraphCanvasMenu v-if="!betaMenuEnabled && canvasMenuEnabled" />
  <canvas
    ref="canvasRef"
    id="graph-canvas"
    tabindex="1"
    class="w-full h-full touch-none"
    @contextmenu.prevent
  />
  <!--<NodeSearchboxPopover />-->
  <!--<SelectionOverlay v-if="selectionToolboxEnabled">
    <SelectionToolbox />
  </SelectionOverlay>-->
  <NodeTooltip v-if="tooltipEnabled" />
  <NodeBadge />
  <rightClickMenusPopover ref="customRightClickMenuRef" />
  <div
    v-for="node in nodes"
    :key="node.id"
    style=""
    class="node_style"
    :style="nodeStyle(node)"
  >
    <DeleteIcon :nodeId="node.id" @delete-node="deleteNode" />
  </div>

  <!--<div
    v-show="showOutputMenu"
    class="fixed inset-0 z-40"
    @click="handleClickOutside"
  />-->
  <div
    ref="outMenuRef"
    @click.stop
    v-if="showOutputMenu"
    class="output-menu-container"
    :style="outputMenuPosition"
  >
    <div
      v-for="(input, index) in nodesInputs"
      :key="index"
      class="menu-item hover:bg-gray-100 cursor-pointer p-2"
      @click="handleNodesInput(input)"
    >
      <div class="nis_item">{{ input.display_name }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LGraphNode, LiteGraph } from '@comfyorg/litegraph'
import { useEventListener } from '@vueuse/core'
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  watch,
  watchEffect
} from 'vue'

import LiteGraphCanvasSplitterOverlay from '@/components/LiteGraphCanvasSplitterOverlay.vue'
import BottomPanel from '@/components/bottomPanel/BottomPanel.vue'
import GraphCanvasMenu from '@/components/graph/GraphCanvasMenu.vue'
import NodeBadge from '@/components/graph/NodeBadge.vue'
import NodeTooltip from '@/components/graph/NodeTooltip.vue'
import TitleEditor from '@/components/graph/TitleEditor.vue'
import SideToolbar from '@/components/sidebar/SideToolbar.vue'
import SideToolbarCustom from '@/components/sidebar/SideToolbarCustom.vue'
// updateCustom
import SecondRowWorkflowTabs from '@/components/topbar/SecondRowWorkflowTabs.vue'
import { useCanvasDrop } from '@/composables/useCanvasDrop'
import { useContextMenuTranslation } from '@/composables/useContextMenuTranslation'
import { useCopy } from '@/composables/useCopy'
import { useGlobalLitegraph } from '@/composables/useGlobalLitegraph'
import { useLitegraphSettings } from '@/composables/useLitegraphSettings'
import { usePaste } from '@/composables/usePaste'
import { useWorkflowPersistence } from '@/composables/useWorkflowPersistence'
import { CORE_SETTINGS } from '@/constants/coreSettings'
import { i18n } from '@/i18n'
import { api } from '@/scripts/api'
import { app as comfyApp } from '@/scripts/app'
import { ChangeTracker } from '@/scripts/changeTracker'
import { IS_CONTROL_WIDGET, updateControlWidgetLabel } from '@/scripts/widgets'
import { useColorPaletteService } from '@/services/colorPaletteService'
import { useLitegraphService } from '@/services/litegraphService'
import { useWorkflowService } from '@/services/workflowService'
import { useCommandStore } from '@/stores/commandStore'
import { useCanvasStore } from '@/stores/graphStore'
import { useNodeDefStore } from '@/stores/nodeDefStore'
import { useSettingStore } from '@/stores/settingStore'
import { useColorPaletteStore } from '@/stores/workspace/colorPaletteStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'

const emit = defineEmits(['ready'])
const canvasRef = ref<HTMLCanvasElement | null>(null)
const settingStore = useSettingStore()
const nodeDefStore = useNodeDefStore()
const workspaceStore = useWorkspaceStore()
const canvasStore = useCanvasStore()
const betaMenuEnabled = computed(
  () => settingStore.get('Comfy.UseNewMenu') !== 'Disabled'
)
const workflowTabsPosition = computed(() =>
  settingStore.get('Comfy.Workflow.WorkflowTabsPosition')
)
const canvasMenuEnabled = computed(() =>
  settingStore.get('Comfy.Graph.CanvasMenu')
)
const tooltipEnabled = computed(() => settingStore.get('Comfy.EnableTooltips'))

const sidebarLocation = computed(() =>
  settingStore.get('Comfy.Sidebar.Location')
)

const selectionToolboxEnabled = computed(() =>
  settingStore.get('Comfy.Canvas.SelectionToolbox')
)

watchEffect(() => {
  nodeDefStore.showDeprecated = settingStore.get('Comfy.Node.ShowDeprecated')
})

watchEffect(() => {
  nodeDefStore.showExperimental = settingStore.get(
    'Comfy.Node.ShowExperimental'
  )
})

watchEffect(() => {
  const spellcheckEnabled = settingStore.get('Comfy.TextareaWidget.Spellcheck')
  const textareas = document.querySelectorAll('textarea.comfy-multiline-input')

  textareas.forEach((textarea: HTMLTextAreaElement) => {
    textarea.spellcheck = spellcheckEnabled
    // Force recheck to ensure visual update
    textarea.focus()
    textarea.blur()
  })
})

watch(
  () => settingStore.get('Comfy.WidgetControlMode'),
  () => {
    if (!canvasStore.canvas) return

    for (const n of comfyApp.graph.nodes) {
      if (!n.widgets) continue
      for (const w of n.widgets) {
        if (w[IS_CONTROL_WIDGET]) {
          updateControlWidgetLabel(w)
          if (w.linkedWidgets) {
            for (const l of w.linkedWidgets) {
              updateControlWidgetLabel(l)
            }
          }
        }
      }
    }
    comfyApp.graph.setDirtyCanvas(true)
  }
)

const colorPaletteService = useColorPaletteService()
const colorPaletteStore = useColorPaletteStore()
watch(
  [() => canvasStore.canvas, () => settingStore.get('Comfy.ColorPalette')],
  ([canvas, currentPaletteId]) => {
    if (!canvas) return

    colorPaletteService.loadColorPalette(currentPaletteId)
  }
)
watch(
  () => colorPaletteStore.activePaletteId,
  (newValue) => {
    settingStore.set('Comfy.ColorPalette', newValue)
  }
)

const loadCustomNodesI18n = async () => {
  try {
    const i18nData = await api.getCustomNodesI18n()
    Object.entries(i18nData).forEach(([locale, message]) => {
      i18n.global.mergeLocaleMessage(locale, message)
    })
  } catch (error) {
    console.error('Failed to load custom nodes i18n', error)
  }
}

const comfyAppReady = ref(false)
const workflowPersistence = useWorkflowPersistence()
useCanvasDrop(canvasRef)
useLitegraphSettings()

onMounted(async () => {
  useGlobalLitegraph()
  useContextMenuTranslation()
  useCopy()
  usePaste()

  comfyApp.vueAppReady = true

  workspaceStore.spinner = true
  // ChangeTracker needs to be initialized before setup, as it will overwrite
  // some listeners of litegraph canvas.
  ChangeTracker.init(comfyApp)
  await loadCustomNodesI18n() // 注
  await settingStore.loadSettingValues() // 注
  CORE_SETTINGS.forEach((setting) => {
    settingStore.addSetting(setting)
  })
  await comfyApp.setup(canvasRef.value)
  canvasStore.canvas = comfyApp.canvas
  canvasStore.canvas.render_canvas_border = false
  workspaceStore.spinner = false

  window['app'] = comfyApp
  window['graph'] = comfyApp.graph

  comfyAppReady.value = true

  // Load color palette
  colorPaletteStore.customPalettes = settingStore.get(
    'Comfy.CustomColorPalettes'
  )

  // Restore workflow and workflow tabs state from storage
  await workflowPersistence.restorePreviousWorkflow()
  workflowPersistence.restoreWorkflowTabsState()

  // Start watching for locale change after the initial value is loaded.
  watch(
    () => settingStore.get('Comfy.Locale'),
    async () => {
      await useCommandStore().execute('Comfy.RefreshNodeDefinitions')
      useWorkflowService().reloadCurrentWorkflow()
    }
  )

  // updateCustom
  updateNodes()

  emit('ready')
})

const nodes = ref<LGraphNode[]>([])
const nodesInputs = ref([])

// 监听画布中的节点变化
const updateNodes = () => {
  if (comfyApp.graph) {
    nodes.value = [...comfyApp.graph.nodes]
  }
}

// 画布初始化后监听节点变化
watch(
  () => comfyAppReady.value,
  (ready) => {
    if (ready) {
      comfyApp.graph.onNodeAdded = () => {
        updateNodes()
      }
      comfyApp.graph.onNodeRemoved = () => {
        updateNodes()
      }
      // 监听画布变化更新节点位置（删除图层位置错乱）
      comfyApp.canvas.onDrawBackground = () => {
        updateNodes()
      }
    }
  }
)

// 格式化坐标
const nodeStyle = (node) => {
  const scale = canvasStore.canvas?.ds?.scale ?? 1
  const width = node.width * scale
  const height = LiteGraph.NODE_TITLE_HEIGHT * scale
  const [left, top] = comfyApp.canvasPosToClientPos(node.pos)

  return {
    left: `${left + width - height}px`,
    width: `${height}px`,
    height: `${height}px`,
    top: `${top - height}px`,
    padding: `${5 * scale}px`
  }
}

// 删除节点
const deleteNode = (nodeId: number) => {
  const node = comfyApp.graph.getNodeById(nodeId)

  if (node) {
    comfyApp.graph.remove(node)
    updateNodes()
  }
}

/** 过滤输出类型匹配的节点 */
const getRelatedNodesByOutputType = (outputType, nodes) => {
  return nodes.filter((node) => {
    const requiredInputs = node.inputs?.required
    if (requiredInputs) {
      return Object.values(requiredInputs).some((input: { type: string }) => {
        return input.type === 'STRING'
          ? LiteGraph.isValidConnection(outputType, input.type)
          : LiteGraph.isValidConnection(outputType, input.type)
        /*if (input.type === "STRING") {
          if (input.forceInput) {
            return LiteGraph.isValidConnection(outputType, input.type)
          }
        } else {
          return LiteGraph.isValidConnection(outputType, input.type)
        }*/
      })
    }
    return false
  })
}

const showOutputMenu = ref(false)
const outputMenuPosition = ref({
  left: '0px',
  top: '0px'
})
const clickedNode = ref(null)
const outMenuRef = ref<HTMLElement | null>(null)

/** 计算窗口位置 */
const calculateMenuPosition = (node) => {
  if (!node) return { left: '0px', top: '0px' }

  const scale = canvasStore.canvas?.ds?.scale ?? 1
  const nodeWidth = node.size[0] * scale
  const nodeHeight = node.size[1] * scale
  const [nodeLeft, nodeTop] = comfyApp.canvasPosToClientPos(node.pos)

  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  const menuWidth = 200
  const menuHeight = Math.min(nodesInputs.value.length * 40, 300)

  let left = nodeLeft + nodeWidth + 10
  let top = nodeTop + nodeHeight / 2 - menuHeight / 2

  if (left + menuWidth > viewportWidth) {
    left = nodeLeft - menuWidth - 10 // 左
  }

  // 上
  if (top < 10) {
    top = 10
  }

  // 下
  if (top + menuHeight > viewportHeight) {
    top = viewportHeight - menuHeight - 10
  }

  return {
    left: `${left}px`,
    top: `${top}px`
  }
}

/** 显示菜单 */
const handleOutputMenuShow = (ev: CustomEvent) => {
  const {
    detail: { node, outputInfo }
  } = ev

  clickedNode.value = node
  nodesInputs.value = getRelatedNodesByOutputType(
    outputInfo.type,
    nodeDefStore.utilsNodes
  ).slice(0, 10) // nodeDefStore.visibleNodeDefs

  setTimeout(() => {
    nextTick(() => {
      outputMenuPosition.value = calculateMenuPosition(node)
      showOutputMenu.value = true
    })
  }, 0)
}

const handleClickOutside = (event: MouseEvent) => {
  if (
    showOutputMenu.value &&
    outMenuRef.value &&
    !outMenuRef.value.contains(event.target as Node)
  ) {
    clickedNode.value = null
    showOutputMenu.value = false
  }
}

const handleNodesInput = async (input) => {
  if (!clickedNode.value) return

  useLitegraphService().addNodeOnGraph(input)
  showOutputMenu.value = false
}

useEventListener(document, 'showOutputMenu', handleOutputMenuShow)
useEventListener(document, 'click', handleClickOutside)

onUnmounted(() => {
  document.removeEventListener('showOutputMenu', handleOutputMenuShow)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.node_style {
  position: absolute;
  z-index: 0;
  left: 0;
  top: 0;
  cursor: pointer;
}
.output-menu-container {
  position: fixed;
  z-index: 1000;
  background: white;
  border: 1px solid #ddd;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.5);
  border-radius: 0.6rem;
  overflow: hidden;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  min-width: 200px;
  max-width: 300px;
  max-height: 300px;
  overflow-y: auto;
  margin: 0;
  padding: 0.5rem;
}
.output-menu-container .menu-item {
  border-bottom: 1px solid #eee;
}
.output-menu-container .menu-item:hover {
  background-color: rgba(255, 255, 255, 0.5);
}
.nis_item {
  padding: 8px 12px;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.custom-context-menu li {
  height: 2rem;
  font-size: 0.8rem;
  color: rgb(51, 51, 51);
  line-height: 2rem;
}
</style>
