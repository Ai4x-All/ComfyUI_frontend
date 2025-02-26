// @ts-strict-ignore
import { LGraphCanvas, LiteGraph } from '@comfyorg/litegraph'
import { LGraphNode } from '@comfyorg/litegraph'
import icon01 from '@/assets/images/icon_right_menue_1.png'

import { app } from '../../scripts/app'
import { ComfyWidgets } from '../../scripts/widgets'

app.registerExtension({
  name: 'Comfy.ShowTextNode',
  registerCustomNodes() {
    class ShowTextNode extends LGraphNode {
      static category: string
      static collapsable: boolean
      static title_mode: number
      icon: string

      // color = LGraphCanvas.node_colors.blue.color
      // bgcolor = LGraphCanvas.node_colors.blue.bgcolor
      // groupcolor = LGraphCanvas.node_colors.blue.groupcolor
      isVirtualNode: boolean

      constructor(title?: string) {
        super(title)
        if (!this.properties) {
          this.properties = { text: '' }
        }
        ComfyWidgets.STRING(
          this,
          'text01',
          ['', { default: this.properties.text, multiline: true }],
          app
        )

        this.serialize_widgets = true
        this.isVirtualNode = true
        this.icon = icon01

        this.addInput('text', 'string')
      }

      onExecute() {
        const inputData = this.getInputData(0);
        if (inputData) {
          this.properties.description = inputData as string;
          // this.widgets[0].value = this.properties.description;
          if (this.widgets.length > 0) {
            (this.widgets[0] as any).value = this.properties.description;
          }
        }
      }
    }

    LiteGraph.registerNodeType(
      '注释便签',
      Object.assign(ShowTextNode, {
        title_mode: LiteGraph.NORMAL_TITLE,
        title: '注释便签',
        collapsable: true
      })
    )

    ShowTextNode.category = 'CustomUtils'
  }
})
