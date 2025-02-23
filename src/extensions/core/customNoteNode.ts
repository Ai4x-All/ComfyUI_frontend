// @ts-strict-ignore
import { LGraphCanvas, LiteGraph } from '@comfyorg/litegraph'
import { LGraphNode } from '@comfyorg/litegraph'

import { app } from '../../scripts/app'
import { ComfyWidgets } from '../../scripts/widgets'
import IconDel from "@/assets/images/logo.png"

/** 文本域 */
class CustomNoteNode extends LGraphNode {
  static collapsable: boolean
  static title_mode: number

  isVirtualNode: boolean;

  constructor(title?: string) {
    super(title)
    if (!this.properties) {
        this.properties = { text: '文本' }
    }

    // 节点实例 部件名称 部件配置 this.properties.text（节点的 text 属性） 允许多行输入 app应用实例
    ComfyWidgets.STRING(this, '', ['', { default: this.properties.text || '文本', multiline: true }], app)

    this.serialize_widgets = true
    this.isVirtualNode = true

    this.addOutput('描述', 'CustomNote')
  }

  /*onDrawTitleBar(ctx, titleHeight, size) {
    const { width } = size;

    // 绘制标题背景
    // ctx.fillStyle = "red";
    // ctx.fillRect(0, 0, width, titleHeight);

    // 左侧图标

    // 中间标题文字

    // 右侧删除图标

    // 右侧展开/收缩图标
  }*/

  onDrawTitleBox = function (ctx, height, size, scale) {
    // const fill = ctx.fillStyle
    // ctx.beginPath()
    // ctx.rect(11, -height + 11, 2, 2)
    // ctx.rect(14, -height + 11, 2, 2)
    // ctx.rect(17, -height + 11, 2, 2)
    // ctx.rect(11, -height + 14, 2, 2)
    // ctx.rect(14, -height + 14, 2, 2)
    // ctx.rect(17, -height + 14, 2, 2)
    // ctx.rect(11, -height + 17, 2, 2)
    // ctx.rect(14, -height + 17, 2, 2)
    // ctx.rect(17, -height + 17, 2, 2)
    //
    // ctx.fillStyle = 'red'
    // ctx.fill()
    // ctx.fillStyle = fill
  }
}

app.registerExtension({
  name: "Comfy.123",
  registerCustomNodes() {
    LiteGraph.registerNodeType('CustomNote', Object.assign(CustomNoteNode, {
        title_mode: LiteGraph.NORMAL_TITLE,
        title: '文本域',
        collapsable: true
    }))
    CustomNoteNode.category = "utils"
  },
});
