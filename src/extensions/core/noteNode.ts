// @ts-strict-ignore
import { LGraphCanvas, LiteGraph } from '@comfyorg/litegraph'
import { LGraphNode } from '@comfyorg/litegraph'

import { app } from '@/scripts/app'
import { ComfyWidgets } from '@/scripts/widgets'
import IconDel from "@/assets/images/logo.png"

// Node that add notes to your project

app.registerExtension({
  name: 'Comfy.NoteNode',
  registerCustomNodes() {
    class NoteNode extends LGraphNode {
      static category: string
      static collapsable: boolean
      static title_mode: number

      // color = LGraphCanvas.node_colors.yellow.color
      // bgcolor = LGraphCanvas.node_colors.yellow.bgcolor
      // groupcolor = LGraphCanvas.node_colors.yellow.groupcolor
      isVirtualNode: boolean

      constructor(title?: string) {
        super(title)
        if (!this.properties) {
          this.properties = { text: '' }
        }
        ComfyWidgets.STRING(
          // Should we extends LGraphNode?  Yesss
          this,
          '',
          ['', { default: this.properties.text, multiline: true }],
          app
        )

        this.serialize_widgets = true
        this.isVirtualNode = true

        // this.icon = new Image()
        // this.icon.src = IconDel
      }

      /*drawTitleBarBackground(ctx: CanvasRenderingContext2D, options: {
        scale: number;
        title_height?: number;
        low_quality?: boolean;
      }) {
        console.log(this.pos)
        const { scale, title_height = 20 } = options;
        const x = this.pos[0];
        const y = this.pos[1];
        const width = this.size[0];
        const height = title_height * scale;

        // 绘制标题栏背景
        // ctx.fillStyle = this.bgcolor;
        // ctx.fillRect(x, y, width, height);

        // 绘制删除图标
        const iconSize = 20 * scale;
        const iconX = x + width - iconSize - 5 * scale;
        const iconY = y + (height - iconSize) / 2;

        if (this.icon.complete) {
          ctx.drawImage(this.icon, iconX, iconY, iconSize, iconSize);
          this.deleteIconRect = { x: iconX, y: iconY, width: iconSize, height: iconSize }
        } else {
          this.icon.onload = () => {
            ctx.drawImage(this.icon, iconX, iconY, iconSize, iconSize);
            this.deleteIconRect = { x: iconX, y: iconY, width: iconSize, height: iconSize }
          }
        }
      }*/

      /*onMouseDown(e, pos: number[], canvas: LGraphCanvas) {
        const { x, y } = pos
        if (this.deleteIconRect &&
          x >= this.deleteIconRect.x &&
          x <= this.deleteIconRect.x + this.deleteIconRect.width &&
          y >= this.deleteIconRect.y &&
          y <= this.deleteIconRect.y + this.deleteIconRect.height) {
          this.deleteNode();
          return true
        }

        const scale = canvas.ds.scale;
        const iconSize = 20 * scale;
        const iconX = this.pos[0] + this.size[0] - iconSize - 5 * scale;
        const iconY = this.pos[1] + (20 * scale - iconSize) / 2;

        // 检查点击位置是否在图标区域内
        if (pos[0] >= iconX && pos[0] <= iconX + iconSize && pos[1] >= iconY && pos[1] <= iconY + iconSize) {
          this.deleteNode();
          e.stopPropagation();
        }
      }*/

      onAction(action: string) {
        if (action === 'delete') {
          this.deleteNode()
        }
      }

      deleteNode() {
        app.graph.remove(this)
      }
    }

    // Load default visibility
    LiteGraph.registerNodeType('Note', Object.assign(NoteNode, {
      title_mode: LiteGraph.NORMAL_TITLE,
      title: 'Note',
      collapsable: true
    }))

    NoteNode.category = 'utils'

    /** Markdown variant of NoteNode */
    class MarkdownNoteNode extends LGraphNode {
      static title = 'Markdown Note'

      // color = LGraphCanvas.node_colors.yellow.color
      // bgcolor = LGraphCanvas.node_colors.yellow.bgcolor
      // groupcolor = LGraphCanvas.node_colors.yellow.groupcolor

      constructor(title?: string) {
        super(title)
        if (!this.properties) {
          this.properties = { text: '' }
        }
        ComfyWidgets.MARKDOWN(
          this,
          '',
          ['', { default: this.properties.text }],
          app
        )

        this.serialize_widgets = true
        this.isVirtualNode = true
      }
    }

    LiteGraph.registerNodeType('MarkdownNote', MarkdownNoteNode)
    MarkdownNoteNode.category = 'utils'
  }
})
