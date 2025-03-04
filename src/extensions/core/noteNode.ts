// @ts-strict-ignore
import { LGraphCanvas, LiteGraph } from '@comfyorg/litegraph'
import { LGraphNode } from '@comfyorg/litegraph'

import { app } from '@/scripts/app'
import { ComfyWidgets } from '@/scripts/widgets'
import { useAbsolutePosition } from '@/composables/element/useAbsolutePosition'
import IconDel from "@/assets/images/icon_del.png"

// Node that add notes to your project

app.registerExtension({
  name: 'Comfy.NoteNode',
  registerCustomNodes() {
    class NoteNode extends LGraphNode {
      static category: string = 'utils';
      static collapsable: boolean = true;
      static title_mode: number = LiteGraph.NORMAL_TITLE;
      static icon: string
      static titleHeight: number | string = LiteGraph.NODE_TITLE_HEIGHT;
      static titleWidth: any = LiteGraph.NODE_WIDTH;

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

        // this.icon = new Image();
        // this.icon.src = IconDel;
        // this.titleHeight = LiteGraph.NODE_TITLE_HEIGHT;
        // this.titleWidth = LiteGraph.NODE_WIDTH;
      }

      /*onDrawForeground(ctx: CanvasRenderingContext2D, options: { scale: number; title_height?: number; low_quality?: boolean; }) {
       const nodeWidth = this.size[0];
        const nodeX = this.pos[0];
        const nodeY = this.pos[1];

        const iconWidth = 24;
        const iconHeight = 24;

        const { style } = useAbsolutePosition();
        const { left, top } = style.value;
        const iconX = parseFloat(left.replace('px', ''));
        const iconY = parseFloat(top.replace('px', ''));

        const iconDx = nodeWidth - iconWidth - 8;
        const iconDy = -this.titleHeight+(this.titleHeight - iconHeight)/2

       const [clientX, clientY] = app.clientPosToCanvasPos(this.pos);

       this.delIcon = { x: nodeX, y: nodeY, x2: nodeX + iconDx, y2: nodeY + iconDy, width: iconWidth, height: iconHeight, clientX, clientY };
       this.deleteIconRect = { x: iconDx, y: iconDy, width: iconWidth, height: iconHeight };

        if (this.icon.complete) {
          ctx.drawImage(this.icon, iconDx, iconDy, iconWidth, iconHeight);
        } else {
          this.icon.onload = () => {
            ctx.drawImage(this.icon, iconDx, iconDy, iconWidth, iconHeight);
          };
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
