// @ts-strict-ignore
import {
  ContextMenu,
  DragAndScale,
  LGraph,
  LGraphBadge,
  LGraphCanvas,
  LGraphGroup,
  LGraphNode,
  LLink,
  LiteGraph,
} from '@comfyorg/litegraph';
import IconDel from '@/assets/images/icon_del.png'
import { useAbsolutePosition } from '@/composables/element/useAbsolutePosition'
import { useCanvasStore } from '@/stores/graphStore'
import { app } from '@/scripts/app'

/**
 * Assign all properties of LiteGraph to window to make it backward compatible.
 */

export const useGlobalLitegraph = () => {
  // Export LiteGraph components to the global window object
  window['LiteGraph'] = LiteGraph;
  window['LGraph'] = LGraph;
  window['LLink'] = LLink;
  window['LGraphNode'] = LGraphNode;
  window['LGraphGroup'] = LGraphGroup;
  window['DragAndScale'] = DragAndScale;
  window['LGraphCanvas'] = LGraphCanvas;
  window['ContextMenu'] = ContextMenu;
  window['LGraphBadge'] = LGraphBadge;

  const icon = new Image()
  icon.src = IconDel

  const canvasStore = useCanvasStore()

  /*const newWidth = Size.width * scale;
  const newHeight = Size.height * scale;
  console.log(newWidth, newHeight)*/
  const titleHeight = LiteGraph.NODE_TITLE_HEIGHT
  const titleWidth = LiteGraph.NODE_WIDTH

  /** 创建图标 */
  /*const originalOnDrawForeground = LGraphNode.prototype.onDrawForeground;
  LGraphNode.prototype.onDrawForeground = function(ctx: CanvasRenderingContext2D, canvas: LGraphCanvas, canvasElement: HTMLCanvasElement) {
    if (originalOnDrawForeground) {
      originalOnDrawForeground.call(this, ctx, canvas, canvasElement);
    }

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
    const iconDy = -titleHeight+(titleHeight - iconHeight)/2

    const [clientX, clientY] = app.clientPosToCanvasPos(this.pos);

    this.delIcon = { x: nodeX, y: nodeY, x2: nodeX + iconDx, y2: nodeY + iconDy, width: iconWidth, height: iconHeight, clientX, clientY };
    this.deleteIconRect = { x: iconDx, y: iconDy, width: iconWidth, height: iconHeight };

    if (icon.complete) {
      ctx.drawImage(icon, iconDx, iconDy, iconWidth, iconHeight);
    } else {
      icon.onload = () => {
        ctx.drawImage(icon, iconDx, iconDy, iconWidth, iconHeight);
      };
    }
  };*/

  /** 删除事件 */
  /*const originalOnMouseDown = LGraphNode.prototype.onMouseDown;
  LGraphNode.prototype.onMouseDown = function (e: MouseEvent, pos: number[], canvas: LGraphCanvas) {
    const [clientX, clientY] = app.clientPosToCanvasPos(pos);
    const [left, top] = app.canvasPosToClientPos(pos)

    console.log(pos)
    console.log(clientX, clientY)
    console.log(left, top)
    console.log(this.deleteIconRect)
    console.log(this.delIcon)

    /!*if (this.delIcon && xxx) {
      if (this.graph) {
        this.graph.remove(this);
      }
      return true;
    }*!/

    return originalOnMouseDown ? originalOnMouseDown.call(this, e, pos, canvas) : false;
  };*/
};
