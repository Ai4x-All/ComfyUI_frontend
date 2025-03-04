import { LGraphCanvas, LGraphNode, LiteGraph } from '@comfyorg/litegraph'
import icon01 from '@/assets/images/icon_right_menue_1.png'

import { app } from '@/scripts/app'
import { ComfyWidgets } from '@/scripts/widgets'

app.registerExtension({
  name: 'Comfy.CustomNoteNode',
  registerCustomNodes() {
    class CustomNoteNode extends LGraphNode {
      static category: string
      static collapsable: boolean
      static title_mode: number
      icon: string
      isVirtualNode: boolean

      constructor(title?: string) {
        super(title)
        if (!this.properties) {
          this.properties = { text: '' }
        }

        const inputData = [
          'string',
          { default: this.properties.text || '文本', multiline: true },
        ]

        ComfyWidgets.STRING(this, 'text', inputData, app)

        this.serialize_widgets = true
        this.isVirtualNode = true
        this.icon = icon01

        this.addOutput('文本', 'STRING', {
          color_on: 'green',
          color_off: 'green'
        })
        this.addOutput('图像', 'IMAGE')
        this.addOutput('遮罩', 'MASK', {
          color_off: 'yellow'
        })

        this.onOutputClick = (index, cme)=> {
          const outputInfo = this.outputs[index]
          const detail = {
            node: this,
            outputInfo,
            pos: this.pos,
            size: this.size,
            index
          }

          const event = new CustomEvent('showOutputMenu', { detail })
          document.dispatchEvent(event)

          return true
        }

        // 圆点双击事件
        /*this.onOutputDblClick = (e, pos)=> {
          return true
        }*/

        // 节点双击
        /*this.onDblClick =(e, pos)=> {
          return true
        }*/
      }
    }

    LiteGraph.registerNodeType(
      'CustomNote',
      Object.assign(CustomNoteNode, {
        title_mode: LiteGraph.NORMAL_TITLE,
        title: '文字提示词',
        collapsable: true
      })
    )

    CustomNoteNode.category = 'CustomUtils'
  }
})

/*
getMenuOptions() {
  return [
    {
      content: "节点操作",
      submenu: {
        options: [
          {
            content: "复制节点",
            callback: () => {
              console.log("复制节点");
            }
          },
          {
            content: "删除节点",
            callback: () => {
              console.log("删除节点");
            }
          }
        ]
      }
    },
    null,
    {
      content: "更多选项",
      callback: () => {
        console.log("更多选项");
      }
    }
  ];
}
* */
