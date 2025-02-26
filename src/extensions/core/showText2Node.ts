// @ts-strict-ignore
import { LGraphCanvas, LiteGraph } from '@comfyorg/litegraph'
import { LGraphNode } from '@comfyorg/litegraph'

import { app } from '../../scripts/app'
import { ComfyWidgets } from '../../scripts/widgets'

/**
 * name： ShowText2
 * desc：显示文本信息
 *  - 接收输入的文本并在节点上以多个只读文本框的形式展示这些文本。
 * */ 
class ShowText2Node extends LGraphNode {
  static title = 'Show Text 2';
  static desc = 'Displays input text in multiple read-only text boxes';
  static category = 'utils';

  color = LGraphCanvas.node_colors.blue.color;
  bgcolor = LGraphCanvas.node_colors.blue.bgcolor;
  groupcolor = LGraphCanvas.node_colors.blue.groupcolor;
  isVirtualNode: boolean;

  constructor(title?: string) {
    super(title)
    this.isVirtualNode = true;
    this.addInput('Text', 'string');

    this.addWidget('string', 'text2', '', () => {}, { multiline: true, readonly: true });
  }

  onExecute() {
    const text = this.getInputData(0);
    if (text) {
      this.populate(text);
    }
  }

  populate(text) {
    if (this.widgets) {
      for (let i = 1; i < this.widgets.length; i++) {
        this.widgets[i].onRemove?.();
      }
      this.widgets.length = 1;
    }

    const v = [...text];
    if (!v[0]) {
      v.shift();
    }
    for (const list of v) {
      const w = ComfyWidgets["STRING"](this, "text2", ["STRING", { multiline: true }], app).widget;
      const inputEl = (w as any).inputEl;

      if (inputEl) {
        inputEl.readOnly = true;
        inputEl.style.opacity = 0.6;
      }

      w.value = list;
    }

    requestAnimationFrame(() => {
      const sz = this.computeSize();
      // 保证sz[0] this.size[0] 为number类型
      const computedWidth = typeof sz[0] === 'number' ? sz[0] : 0;
      const currentWidth = typeof this.size[0] === 'number' ? this.size[0] : 0;
      const computedHeight = typeof sz[1] === 'number' ? sz[1] : 0;
      const currentHeight = typeof this.size[1] === 'number' ? this.size[1] : 0;

      const finalWidth = computedWidth < currentWidth ? currentWidth : computedWidth;
      const finalHeight = computedHeight < currentHeight ? currentHeight : computedHeight;

      this.onResize?.([finalWidth, finalHeight]);
      app.graph.setDirtyCanvas(true, false);
    });
  }

  onConfigure(info) {
    // super.onConfigure(info);
    // if (this.widgets_values?.length) {
    //   this.populate(this.widgets_values.slice(this.widgets_values.length > 1 ? 1 : 0));
    // }
  }
}

app.registerExtension({
  name: "Comfy.ShowText2Node",
  registerCustomNodes(app) {
    LiteGraph.registerNodeType('utils/ShowText2', ShowText2Node);
    ShowText2Node.category = 'utils'
  },
});
