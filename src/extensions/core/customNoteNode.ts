// @ts-strict-ignore
import { LGraphCanvas, LiteGraph } from '@comfyorg/litegraph'
import { LGraphNode } from '@comfyorg/litegraph'
import icon01 from '@/assets/images/icon_right_menue_1.png'

import { app } from '@/scripts/app'
import { ComfyWidgets } from '@/scripts/widgets'

/** 文本域 */
class CustomNoteNode extends LGraphNode {
  static collapsable: boolean
  static title_mode: number
  // static shape: string

  isVirtualNode: boolean;
  icon: string
  img: HTMLImageElement;

  constructor(title?: string) {
    super(title)
    if (!this.properties) {
        this.properties = { text: '文本' }
    }
    // 节点实例 部件名称 部件配置 this.properties.text（节点的 text 属性） 允许多行输入 app应用实例
    const inputData = [
      'string',
      { default: this.properties.text || '文本', multiline: true }
    ]

    ComfyWidgets.STRING(this, 'text', inputData, app)

    this.serialize_widgets = true
    this.isVirtualNode = true
    this.icon = icon01

    this.addOutput('text', 'string')
  }
}

app.registerExtension({
  name: "Comfy.CustomNoteNode",
  registerCustomNodes() {
    LiteGraph.registerNodeType('文字提示词', Object.assign(CustomNoteNode, {
        title_mode: LiteGraph.NORMAL_TITLE,
        title: '文字提示词',
        collapsable: true,
        // shape: "box", // 节点形状
    }))
    CustomNoteNode.category = "utils"
  },
});
