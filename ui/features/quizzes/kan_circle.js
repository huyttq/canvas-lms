import Konva from 'konva'
import uuid from 'uuid'

export default class KanCircle {
  constructor(circleNode, editable) {
    this.editable = editable
    this.circleNode = circleNode

    this.circleNode.draggable(editable)
    if (editable) {
      this.registerEvents()
    }
  }

  toKonvaNode() {
    return this.circleNode
  }

  width() {
    return this.circleNode.width()
  }

  height() {
    return this.circleNode.height()
  }

  registerEvents() {
    this.circleNode.on('dragstart', evt => {
      // this.tooltip.hide()
    })
    this.circleNode.on('dragend', evt => {
      this.circleNode.fire('datachange', {}, true)
    })
    this.circleNode.on('mouseover', evt => {
      const shape = evt.target
      shape.scaleX(1.2)
      shape.scaleY(1.2)
      document.body.style.cursor = 'pointer'

      // const mousePos = this.stage.getPointerPosition()
      // this.tooltip.position({
      //   x: mousePos.x + 5,
      //   y: mousePos.y + 5
      // })
      // this.tooltipText.text('Drag the circle to the body position')
      // this.tooltip.show()
    })
    this.circleNode.on('mouseout', evt => {
      const shape = evt.target
      document.body.style.cursor = 'default'
      shape.scaleX(1)
      shape.scaleY(1)
      // this.tooltip.hide()
    })
  }

  static create(config) {
    const circleNode = new Konva.Circle({
      id: uuid(),
      radius: 8,
      strokeWidth: 1,
      opacity: 0.7,
      name: 'cloneable input_circle',
      ...config
    })

    return new KanCircle(circleNode, true)
  }

  static convert(circleNode, editable) {
    return new KanCircle(circleNode, editable)
  }
}
