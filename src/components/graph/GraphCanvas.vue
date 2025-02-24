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
      <SecondRowWorkflowTabs v-if="workflowTabsPosition === 'Topbar (2nd-row)' && sidebarLocation !== 'float'" class="pointer-events-auto" />
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
  />
  <NodeSearchboxPopover />
  <!--<SelectionOverlay v-if="selectionToolboxEnabled">
    <SelectionToolbox />
  </SelectionOverlay>-->
  <NodeTooltip v-if="tooltipEnabled" />
  <NodeBadge />
  <!--  <rightClickMenusPopover ref="customRightClickMenuRef" />-->
  <div
    v-for="node in nodes"
    :key="node.id"
    style=""
    class="node_style"
    :style="nodeStyle(node)"
  >
    <DeleteIcon :nodeId="node.id" @delete-node="deleteNode" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, watchEffect } from 'vue'
import { LGraphCanvas, LiteGraph, LGraphNode } from '@comfyorg/litegraph'

import LiteGraphCanvasSplitterOverlay from '@/components/LiteGraphCanvasSplitterOverlay.vue'
import BottomPanel from '@/components/bottomPanel/BottomPanel.vue'
import GraphCanvasMenu from '@/components/graph/GraphCanvasMenu.vue'
import NodeBadge from '@/components/graph/NodeBadge.vue'
import NodeTooltip from '@/components/graph/NodeTooltip.vue'
import SelectionOverlay from '@/components/graph/SelectionOverlay.vue'
import SelectionToolbox from '@/components/graph/SelectionToolbox.vue'
import TitleEditor from '@/components/graph/TitleEditor.vue'
import NodeSearchboxPopover from '@/components/searchbox/NodeSearchBoxPopover.vue'

import rightClickMenusPopover from '../rightClickMenusPopover/rightClickMenusPopover.vue'

import SideToolbar from '@/components/sidebar/SideToolbar.vue'
import SideToolbarCustom from '@/components/sidebar/SideToolbarCustom.vue' // updateCustom
import SecondRowWorkflowTabs from '@/components/topbar/SecondRowWorkflowTabs.vue'
import { useChainCallback } from '@/composables/functional/useChainCallback'
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
import { app, app as comfyApp } from '@/scripts/app'
import { ChangeTracker } from '@/scripts/changeTracker'
import { IS_CONTROL_WIDGET, updateControlWidgetLabel } from '@/scripts/widgets'
import { useColorPaletteService } from '@/services/colorPaletteService'
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
  await loadCustomNodesI18n()
  await settingStore.loadSettingValues()
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

// 监听画布中的节点变化
const updateNodes = () => {
  if (comfyApp.graph) {
    nodes.value = [...comfyApp.graph.nodes]
  }
}

// 画布初始化后监听节点变化
watch(() => comfyAppReady.value, (ready) => {
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
})

// 格式化坐标
const nodeStyle =(node)=> {
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
</script>

<style scoped>
.node_style {
  position: absolute;
  z-index: 1;
  left: 0;
  top: 0;
  cursor: pointer
}
</style>
