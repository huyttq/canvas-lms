import Konva from 'konva'
import uuid from 'uuid'

export default class KanCircle {
  constructor(circleNode, readonly) {
    this.circleNode = circleNode

    this.circleNode.draggable(!readonly)
    if (!readonly) {
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
      this.circleNode.fire('hidetooltip', {}, true)
    })
    this.circleNode.on('dragend', evt => {
      this.circleNode.fire('datachange', {}, true)
    })
    this.circleNode.on('mouseover', evt => {
      const shape = evt.target
      shape.scaleX(1.2)
      shape.scaleY(1.2)
      document.body.style.cursor = 'pointer'
      this.circleNode.fire('showtooltip', {message: 'Drag the circle to the body position'}, true)
    })
    this.circleNode.on('mouseout', evt => {
      const shape = evt.target
      document.body.style.cursor = 'default'
      shape.scaleX(1)
      shape.scaleY(1)
      this.circleNode.fire('hidetooltip', {}, true)
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

    return new KanCircle(circleNode, false)
  }

  static convert(circleNode, readonly) {
    return new KanCircle(circleNode, readonly)
  }
}
