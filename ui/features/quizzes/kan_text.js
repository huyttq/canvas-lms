import Konva from 'konva'
import uuid from 'uuid'

export default class KanText {
  constructor(containerElement, textNode, editable, readonly) {
    this.containerElement = containerElement
    this.editable = editable
    this.textNode = textNode
    this.MIN_WIDTH = 20

    this.textNode.draggable(editable)
    if (readonly) {
      this.textNode.show()
    }
    else {
      if (editable) {
        this.enableTextEditor()
      }
      else {
        this.registerEvents()
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
    const textarea = $('<textarea rows="1"></textarea>')
    textarea.val(this.textNode.text())
    const self = this
    textarea.on('input', function() {
      this.parentNode.dataset.replicatedValue = this.value
      self.textNode.text(this.value)
      self.textNode.fire('datachange', {}, true)
    })
    const autoGrowTextareaWrapper = $('<div class="grow-wrap"></<div>')
    const textPosition = this.textNode.getAbsolutePosition()
    autoGrowTextareaWrapper.css('position', 'absolute')
    autoGrowTextareaWrapper.css('top', textPosition.y - 5 + 'px')
    autoGrowTextareaWrapper.css('left', textPosition.x - 5 + 'px')
    textarea.css('width', this.textNode.width())
    textarea.css('max-height', this.textNode.height() + 2)
    autoGrowTextareaWrapper.append(textarea)
    $(this.containerElement).append(autoGrowTextareaWrapper)
    // do not show konva text here
    this.textNode.hide()
    textarea.trigger('input')
  }

  enableTextEditor() {
    this.textNode.on('mouseover', evt => {
      document.body.style.cursor = 'pointer'
    })
    this.textNode.on('mouseout', evt => {
      document.body.style.cursor = 'default'
    })

    this.textNode.on('dragstart', evt => {
      this.textNode.fire('hidetooltip', {}, true)
    })
    this.textNode.on('dragend', evt => {
      this.textNode.fire('datachange', {}, true)
    })

    this.textNode.on('transform', () => {
      this.textNode.setAttrs({
        width: Math.max(this.textNode.width() * this.textNode.scaleX(), this.MIN_WIDTH),
        height: Math.max(this.textNode.height() * this.textNode.scaleY(), 10),
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
