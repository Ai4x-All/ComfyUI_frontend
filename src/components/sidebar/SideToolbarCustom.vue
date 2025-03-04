<template>
  <teleport :to="teleportTarget">
    <div class="comfyui-body-float_body">
      <div
        class="side-tool-bar_top"
        :style="{
          height:
            teleportTarget === '.comfyui-body-float' ? 'fit-content' : '100%'
        }"
      >
        <div
          v-if="teleportTarget === '.comfyui-body-float'"
          class="side-tool-bar_title"
        >
          <div class="side_title">灵感画布</div>
          <img
            src="../../assets/images/fold_icon.png"
            @click="handleHideScale"
            alt=""
          />
        </div>
        <nav
          class="side-tool-bar-container"
          :class="{ 'small-sidebar': isSmall }"
        >
          <SidebarIcon
            v-for="tab in tabs"
            :key="tab.id"
            :icon="tab.icon"
            :iconBadge="tab.iconBadge"
            :tooltip="tab.tooltip + getTabTooltipSuffix(tab)"
            :selected="tab.id === selectedTab?.id"
            :class="tab.id + '-tab-button'"
            @click="onTabClick(tab)"
          />
          <!--<SidebarLogoutIcon v-if="userStore.isMultiUserServer" />
          <SidebarThemeToggleIcon />
          <SidebarSettingsToggleIcon />-->
        </nav>
      </div>
      <div
        v-if="selectedTab"
        class="sidebar-content-container h-full overflow-y-auto overflow-x-hidden"
      >
        <ExtensionSlot :extension="selectedTab" />
      </div>
      <img class="logo" src="@/assets/images/logo.png" alt="" />
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted } from 'vue'

import ExtensionSlot from '@/components/common/ExtensionSlot.vue'
import SettingDialogContent from '@/components/dialog/content/SettingDialogContent.vue'
import SettingDialogHeader from '@/components/dialog/header/SettingDialogHeader.vue'
import { useDialogStore } from '@/stores/dialogStore'
import { useKeybindingStore } from '@/stores/keybindingStore'
import { useSettingStore } from '@/stores/settingStore'
import { useUserStore } from '@/stores/userStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import type { SidebarTabExtension } from '@/types/extensionTypes'

import SidebarIcon from './SidebarIconCustom.vue'

const workspaceStore = useWorkspaceStore()
const settingStore = useSettingStore()
const userStore = useUserStore()
const dialogStore = useDialogStore()

const teleportTarget = computed(() => {
  const location = settingStore.get('Comfy.Sidebar.Location')
  if (location === 'float') {
    return '.comfyui-body-float'
  } else {
    if (location === 'left') {
      return '.comfyui-body-left'
    }
    if (location === 'right') {
      return '.comfyui-body-right'
    }
    return '.comfyui-body-float'
  }
})

const isSmall = computed(
  () => settingStore.get('Comfy.Sidebar.Size') === 'small'
)

const isCollapsed = computed({
  get: () => userStore.isCollapsed,
  set: (value) => userStore.setIsCollapsed(value)
})

// const isCollapsed = ref(false)

const tabs = computed(() => {
  const tabs = workspaceStore.getSidebarTabs()
  return tabs.filter((tab) => tab.id !== 'model-library')
  // return [...tabs, { id: "setting", icon: 'setting', label: "设置", title: "设置", tooltip: "设置", type: 'settings', component: () => {} }]
})

const selectedTab = computed(() => workspaceStore.sidebarTab.activeSidebarTab)

const onTabClick = (item: SidebarTabExtension) => {
  if (item.id === 'setting') {
    dialogStore.showDialog({
      key: 'global-settings',
      headerComponent: SettingDialogHeader,
      component: SettingDialogContent
    })
    return
  }
  workspaceStore.sidebarTab.toggleSidebarTab(item.id)
}
const keybindingStore = useKeybindingStore()
const getTabTooltipSuffix = (tab: SidebarTabExtension) => {
  const keybinding = keybindingStore.getKeybindingByCommandId(
    `Workspace.ToggleSidebarTab.${tab.id}`
  )
  return keybinding ? ` (${keybinding.combo.toString()})` : ''
}

const handleHideScale = () => {
  const newValue = !isCollapsed.value
  userStore.setIsCollapsed(newValue)
  const bodyFloat = document.querySelector('.comfyui-body-float_body')
  if (bodyFloat) {
    bodyFloat.classList.toggle('collapsed', newValue)
    bodyFloat.classList.toggle('expanded', !newValue)
  }
}

// 设置默认激活的选项卡
onMounted(() => {
  if (!workspaceStore.sidebarTab.activeSidebarTabId && tabs.value.length > 0) {
    nextTick(() => {
      workspaceStore.sidebarTab.toggleSidebarTab(tabs.value[0].id)
    })
  }

  const bodyFloat = document.querySelector('.comfyui-body-float_body')
  if (bodyFloat) {
    bodyFloat.classList.toggle('collapsed', isCollapsed.value)
    bodyFloat.classList.toggle('expanded', !isCollapsed.value)
  }
})

// 监听 tabs 变化
/*watch(tabs, (newTabs) => {
  if (!workspaceStore.sidebarTab.activeSidebarTabId && newTabs.length > 0) {
    workspaceStore.sidebarTab.toggleSidebarTab(newTabs[0].id)
  }
})*/

// 或者直接
/*watchEffect(() => {
  if (!workspaceStore.sidebarTab.activeSidebarTabId && tabs.value.length > 0) {
    workspaceStore.sidebarTab.toggleSidebarTab(tabs.value[0].id)
  }
})*/
</script>
<style scoped>
.comfyui-body-float_body {
  z-index: 10;
  display: flex;
  flex-direction: column;
  width: 18rem;
  height: calc(100vh - 1rem);
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  /*bottom: 0.5rem;*/
  background: rgba(255, 255, 255, 0.5);
  border-radius: 15px;
  overflow: hidden;
  transition: all 0.2s ease-in-out;
}
.side-tool-bar_top {
  width: 100%;
  background-color: rgba(var(--comfy-menu-secondary-bg), 0.8);
  color: var(--fg-color);
  /*box-shadow: var(--bar-shadow);*/
  /*background: rgba(112, 162, 232, 0.5);*/
}
.side-tool-bar_title {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 3rem;
  border-bottom: solid 1px var(--custom-title-color);
  margin: 0 0.8rem 0.5rem;
  transition: all 0.2s ease-in-out;
}
.side-tool-bar_title .side_title {
  font-size: 1rem;
  font-weight: 500;
  color: var(--custom-title-color);
  transition: all 0.2s ease-in-out;
}
.side-tool-bar_title img {
  position: absolute;
  z-index: 2;
  width: 2rem;
  height: 2rem;
  right: 1rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}
.side-tool-bar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  pointer-events: auto;

  width: var(--sidebar-width);
  height: 100%;

  background-color: var(--comfy-menu-secondary-bg);
  color: var(--fg-color);
  box-shadow: var(--bar-shadow);

  --sidebar-width: 4rem;
  --sidebar-icon-size: 1.5rem;
}

.side-tool-bar-container.small-sidebar {
  --sidebar-width: 2.5rem;
  --sidebar-icon-size: 1rem;
}

.side-tool-bar-end {
  align-self: flex-end;
  margin-top: auto;
}
.comfyui-body-float .side-tool-bar-container {
  padding: 0 1rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  height: auto;
  background: none;
  box-shadow: none;
  --sidebar-width: auto;
  --sidebar-icon-size: 1.5rem;
  --sidebar-icon-img-size: 1.8rem;
}
.comfyui-body-float .side-tool-bar-container.small-sidebar {
  --sidebar-width: auto;
  --sidebar-icon-size: 1rem;
  --sidebar-icon-img-size: 1.5rem;
}
.comfyui-body-float_body {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
.comfyui-body-float_body .logo {
  width: 15.8rem;
  position: absolute;
  z-index: -1;
  right: 0;
  bottom: 3rem;
}
.comfyui-body-float_body.collapsed {
  width: 3rem;
  height: 3rem;
  box-shadow: none;
  background: #fff;
}
.comfyui-body-float_body.collapsed img {
  width: 2rem;
  height: 2rem;
  right: -0.25rem;
}
.comfyui-body-float_body.collapsed .side_title {
  opacity: 0;
}
.comfyui-body-float_body.collapsed .side-tool-bar_title {
  border-bottom: none;
}
.comfyui-body-float .sidebar-content-container :deep(.p-tree) {
  background: transparent !important;
}
</style>
