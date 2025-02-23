<template>
  <Button
    :class="props.class"
    text
    :pt="{
      root: {
        class: `side-bar-button ${
          props.selected
            ? 'p-button-primary side-bar-button-selected'
            : 'p-button-secondary'
        }`,
        'aria-label': props.tooltip
      }
    }"
    @click="emit('click', $event)"
    v-tooltip.bottom="{ value: props.tooltip, showDelay: 300, hideDelay: 300 }"
  >
    <!-- addc .bottom -->
    <template #icon>
      <OverlayBadge v-if="shouldShowBadge" :value="overlayValue">
        <img
          :src="formatImg(props.icon)"
          :alt="props.tooltip"
          class="side-bar-button_img"
        />
        <i :class="props.icon + ' side-bar-button-icon'" />
      </OverlayBadge>
      <img
        v-else
        :src="formatImg(props.icon)"
        :alt="props.tooltip"
        class="side-bar-button_img"
      />
      <!-- <i v-else :class="props.icon + ' side-bar-button-icon'" /> -->
    </template>
  </Button>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import OverlayBadge from 'primevue/overlaybadge'
import { PropType, computed } from 'vue'

import icon_modelLibrary from '@/assets/images/icon_modelLibrary.png'
import icon_nodeLibrary from '@/assets/images/icon_nodeLibrary.png'
import icon_queue from '@/assets/images/icon_queue.png'
import icon_setting from '@/assets/images/icon_setting.png'
import icon_workflow from '@/assets/images/icon_workflow_01.png'

// Add this line to import PropsType

const props = defineProps({
  iconSrc: String,
  icon: String,
  selected: Boolean,
  tooltip: {
    type: String,
    default: ''
  },
  class: {
    type: String,
    default: ''
  },
  iconBadge: {
    type: [String, Function] as PropType<string | (() => string | null)>,
    default: ''
  }
})

const emit = defineEmits(['click'])
const overlayValue = computed(() =>
  typeof props.iconBadge === 'function'
    ? props.iconBadge() || ''
    : props.iconBadge
)
const shouldShowBadge = computed(() => !!overlayValue.value)

/** 格式化图标 */
const formatImg = (val: string) => {
  // pi pi-history pi pi-book pi pi-box pi pi-folder-open pi pi-sign-out pi pi-moon pi pi-cog
  if (val === 'pi pi-history') {
    return icon_queue
  }
  if (val === 'pi pi-book') {
    return icon_nodeLibrary
  }
  if (val === 'pi pi-box') {
    return icon_modelLibrary
  }
  if (val === 'pi pi-folder-open') {
    return icon_workflow
  }
  if (val === 'setting') {
    return icon_setting
  }
  return icon_queue
}
</script>

<style>
.side-bar-button-icon {
  font-size: var(--sidebar-icon-size) !important;
}

.side-bar-button-selected .side-bar-button-icon {
  font-size: var(--sidebar-icon-size) !important;
  font-weight: bold;
}
</style>

<style scoped>
.side-bar-button {
  width: var(--sidebar-width);
  height: var(--sidebar-width);
  border-radius: 0;
}

.comfyui-body-left .side-bar-button.side-bar-button-selected,
.comfyui-body-left .side-bar-button.side-bar-button-selected:hover {
  border-left: 4px solid var(--p-button-text-primary-color);
}

.comfyui-body-right .side-bar-button.side-bar-button-selected,
.comfyui-body-right .side-bar-button.side-bar-button-selected:hover {
  border-right: 4px solid var(--p-button-text-primary-color);
}
.comfyui-body-float .side-bar-button.side-bar-button-selected,
.comfyui-body-float .side-bar-button:hover {
  border: none;
  outline: none;
  background: rgba(255, 255, 255, 0.5);
  border-top-right-radius: 5px;
  border-top-left-radius: 5px;
  transform: perspective(10px) rotateX(5deg);
  /*clip-path: polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%);*/
}
.comfyui-body-float .p-button-secondary {
  border: none;
}
.comfyui-body-float .side-bar-button {
  width: revert-layer;
  height: revert-layer;
}

.side-bar-button_img {
  width: var(--sidebar-icon-img-size);
  height: var(--sidebar-icon-img-size);
  object-fit: contain;
}
.side-bar-button-selected .side-bar-button_img {
  width: var(--sidebar-icon-img-size);
  height: var(--sidebar-icon-img-size);
  object-fit: contain;
}
</style>
