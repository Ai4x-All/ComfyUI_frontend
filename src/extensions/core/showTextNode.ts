// @ts-strict-ignore
import { LGraphCanvas, LiteGraph } from '@comfyorg/litegraph'
import { LGraphNode } from '@comfyorg/litegraph'

import { app } from '../../scripts/app'
import { ComfyWidgets } from '../../scripts/widgets'

app.registerExtension({
  name: 'Comfy.ShowTextNode',
  registerCustomNodes() {
    class ShowTextNode extends LGraphNode {
      static category: string
      static collapsable: boolean
      static title_mode: number

      // color = LGraphCanvas.node_colors.blue.color
      // bgcolor = LGraphCanvas.node_colors.blue.bgcolor
      // groupcolor = LGraphCanvas.node_colors.blue.groupcolor
      isVirtualNode: boolean

      constructor(title?: string) {
        super(title)
        if (!this.properties) {
          this.properties = { description: '' }
        }
        ComfyWidgets.STRING(
          this,
          'Description',
          ['', { default: this.properties.description, multiline: true }],
          app
        )

        this.serialize_widgets = true
        this.isVirtualNode = true

        // 添加一个输入槽
        this.addInput('', 'CustomNote')
      }

      // 只能被 NoteNode/MarkdownNoteNode 连接
      connect(slot: number | string, target_node: LGraphNode, target_slot, afterRerouteId?) {
        return null
      }

      // 只能被 NoteNode/MarkdownNoteNode 连接
      connectByType(slot: number | string, target_node: LGraphNode, target_slotType, optsIn) {
        return null
      }

      // 只能被 NoteNode/MarkdownNoteNode 连接
      connectByTypeOutput(slot: number | string, source_node: LGraphNode, source_slotType, optsIn?) {
        return null
      }
    }

    // Load default visibility

    LiteGraph.registerNodeType(
      'ShowText',
      Object.assign(ShowTextNode, {
        title_mode: LiteGraph.NORMAL_TITLE,
        title: '描述',
        collapsable: true
      })
    )

    ShowTextNode.category = 'utils'
  }
})
