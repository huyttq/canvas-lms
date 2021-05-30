import Konva from 'konva'
import uuid from 'uuid'

export default class KanText {
  constructor(containerElement, textNode, editable, readonly) {
    this.containerElement = containerElement
    this.editable = editable
    this.textNode = textNode
    this.MIN_WIDTH = 20

    this.textNode.draggable(editable)
    if (!readonly) {
      this.registerEvents()
      if (editable) {
        this.enableTextEditor()
      }
    }
  }

  toKonvaNode() {
    return this.textNode
  }

  width() {
    return this.textNode.width()
  }

  height() {
    return this.textNode.height()
  }

  registerEvents() {
    this.textNode.off('dblclick dbltap')

    this.textNode.on('mouseover', evt => {
      document.body.style.cursor = 'pointer'
      this.textNode.fire('showtooltip', {message: 'Double click to edit then press Enter'}, true)
    })
    this.textNode.on('mouseout', evt => {
      document.body.style.cursor = 'default'
      this.textNode.fire('hidetooltip', {}, true)
    })
    this.textNode.on('dblclick dbltap', () => {
      const textPosition = this.textNode.getAbsolutePosition()
      // create textarea and style it
      const textarea = document.createElement('textarea')
      $(this.containerElement).append(textarea)

      textarea.value = this.textNode.text()
      textarea.style.position = 'absolute'
      textarea.style.top = textPosition.y - 5 + 'px'
      textarea.style.left = textPosition.x - 5 + 'px'
      textarea.style.width = this.textNode.width()
      textarea.focus()
      textarea.addEventListener('keydown', evt => {
        // hide on enter
        if (evt.keyCode === 13) {
          this.textNode.text(textarea.value)
          this.textNode.fire('datachange', {}, true)
          $(textarea).remove()
        }
      })
    })
  }

  enableTextEditor() {
    this.textNode.on('dragstart', evt => {
      this.textNode.fire('hidetooltip', {}, true)
    })
    this.textNode.on('dragend', evt => {
      this.textNode.fire('datachange', {}, true)
    })

    this.textNode.on('transform', () => {
      // with enabled anchors we can only change scaleX
      // so we don't need to reset height
      // just width
      this.textNode.setAttrs({
        width: Math.max(this.textNode.width() * this.textNode.scaleX(), this.MIN_WIDTH),
        scaleX: 1,
        scaleY: 1
      })
    })
  }

  static create(containerElement, config) {
    const textNode = new Konva.Text({
      id: uuid(),
      text: 'Enter some text',
      fontSize: 14,
      fill: 'green',
      draggable: true,
      name: 'transformable cloneable input_text',
      ...config
    })

    return new KanText(containerElement, textNode, true, false)
  }

  static convert(containerElement, textNode, editable, readonly) {
    return new KanText(containerElement, textNode, editable, readonly)
  }
}
