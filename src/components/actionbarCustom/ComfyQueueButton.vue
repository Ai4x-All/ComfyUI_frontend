<template>
  <div class="queue-button-group flex items-center" >
    <div class="execute_btn_button">
      <div class="execute_btn flex flex-col items-center justify-center" @click="queuePrompt">
        <svg
          width="200"
          height="200"
          viewBox="-50 -50 300 300"
          @mouseenter="isHovered = true" @mouseleave="isHovered = false"
          :class="{ 'heartbeat_ani': isHovered }"
        >
          <polygon class="triangle" stroke-linejoin="round" points="100,30 0,200 200,200"/>
        </svg>
        <span>运行</span>
      </div>
    </div>
    <div class="flex item-center" :class="{ 'hidden': isHidden, 'hide-animation': isHidden }" :style="containerStyle">
      <div class="group_icon_container flex item-center justify-between">
        <AddWorkFlowButton />
        <ClearWorkFlowButton />
        <ThumbButton @toggle="handleToggle" />
        <DragButton ref="dragButtonRef" />
        <HideAllButton />
      </div>
      <img class="clip_path_img" :src="clipIcon" alt="">
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import Button from 'primevue/button'
import ButtonGroup from 'primevue/buttongroup'
import SplitButton from 'primevue/splitbutton'
import { computed, ref, onMounted, watch, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'

import clipIcon from "@/assets/images/icon_bar_x.png";

import BottomPanelToggleButton from '@/components/topbar/BottomPanelToggleButton.vue'
import CommandMenubar from '@/components/topbar/CommandMenubar.vue'
import HideMenuButton from '@/components/topbar/HideMenuButton.vue'
import { useCommandStore } from '@/stores/commandStore'
import {
  useQueuePendingTaskCountStore,
  useQueueSettingsStore
} from '@/stores/queueStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'

import BatchCountEdit from './BatchCountEdit.vue'
const workspaceStore = useWorkspaceStore()
const queueCountStore = storeToRefs(useQueuePendingTaskCountStore())
const { mode: queueMode } = storeToRefs(useQueueSettingsStore())

const { t } = useI18n()
const queueModeMenuItemLookup = computed(() => ({
  disabled: {
    key: 'disabled',
    label: t('menu.queue'),
    tooltip: t('menu.disabledTooltip'),
    command: () => {
      queueMode.value = 'disabled'
    }
  },
  instant: {
    key: 'instant',
    label: `${t('menu.queue')} (${t('menu.instant')})`,
    tooltip: t('menu.instantTooltip'),
    command: () => {
      queueMode.value = 'instant'
    }
  },
  change: {
    key: 'change',
    label: `${t('menu.queue')} (${t('menu.onChange')})`,
    tooltip: t('menu.onChangeTooltip'),
    command: () => {
      queueMode.value = 'change'
    }
  }
}))

const activeQueueModeMenuItem = computed(() => queueModeMenuItemLookup.value[queueMode.value])
const queueModeMenuItems = computed(() => Object.values(queueModeMenuItemLookup.value))

const executingPrompt = computed(() => !!queueCountStore.count.value)
const hasPendingTasks = computed(() => queueCountStore.count.value > 1)

const commandStore = useCommandStore()
const queuePrompt = (e: MouseEvent) => {
  const commandId = e.shiftKey ? 'Comfy.QueuePromptFront' : 'Comfy.QueuePrompt'
  commandStore.execute(commandId)
}

const isHidden = ref(false)
const isHovered = ref(false)
const isCollapsed = ref(false)
const collapseOffset = ref(0)
const dragButtonRef = ref(null)

/*onMounted(() => {
  watch(() => dragButtonRef.value?.dragHandleRef,(handle) => {
    console.log(handle)
    if (handle) {
      dragButtonRef.value = handle
    }},{ immediate: true }
  )
})*/
const getDragHandle = () => dragButtonRef.value?.dragHandleRef
defineExpose({ getDragHandle })

const handleToggle = (buttonLeft) => {
  collapseOffset.value = 100 // buttonLeft
  isCollapsed.value = !isCollapsed.value
  // isHidden.value = true
}

const containerRef = ref<HTMLElement | null>(null)
const originalWidth = ref(0)

onMounted(() => {
  originalWidth.value = containerRef.value?.offsetWidth || 0
})

const containerStyle = computed(() => ({
  transform: isCollapsed.value ? `translateX(-${collapseOffset.value}px)` : 'translateX(0)',
  transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
}))
/*const containerStyle = computed(() => ({
  width: isCollapsed.value
    ? `${originalWidth.value - collapseOffset.value}px`
    : `${originalWidth.value}px`,
  transform: isCollapsed.value
    ? `translateX(-${collapseOffset.value}px)`
    : 'translateX(0)'
}))*/
</script>

<style scoped>
.comfyui-queue-button :deep(.p-splitbutton-dropdown) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.flex-shrink-0 {
  background: #fff;
}
.execute_btn_button {
  width: 4.8rem;
  height: 4.2rem;
}
.execute_btn {
  position: absolute;
  z-index: 1;
  left: 0;
  cursor: pointer;
  width: 4.8rem;
  height: 4.2rem;
  background: url("@/assets/images/icon_execute.png") no-repeat;
  background-size: contain;
  transform: translateX(10px);
}
.execute_btn svg {
  width: 1.8rem;
  height: 1.8rem;
  transform: rotate(90deg);
}
.execute_btn span {
  font-size: .7rem;
  color: #fff;
  padding-top: .2rem;
}
.triangle {
  fill: #fff;
  stroke: #fff;
  stroke-width: 50;
}
.group_icon_container {
  background: #fff;
  height: 2.8rem;
}
.clip_path_img {
  height: 2.8rem;
}
.clip_path_img:nth-child(1) {
  transform: rotateY(180deg);
}

@keyframes heartbeat {
  0% {
    transform: scale(1) rotate(90deg);
  }
  50% {
    transform: scale(1.2) rotate(90deg);
  }
  100% {
    transform: scale(1) rotate(90deg);
  }
}

.execute_btn svg.heartbeat_ani {
  animation: heartbeat 0.8s infinite;
}

.hidden {
  display: none;
}

@keyframes hideFromRight {
  from {
    max-width: 100%;
    opacity: 1;
  }
  to {
    max-width: 0;
    opacity: 0;
  }
}

.hide-animation {
  animation: hideFromRight 0.3s forwards;
}

.queue-button-group {
  overflow: hidden;
  transition: width 0.3s;
}
</style>
