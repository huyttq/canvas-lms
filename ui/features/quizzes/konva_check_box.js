import Konva from 'konva'

export default class KonvaCheckBox {
  constructor(containerElement, group, editable) {
    this.containerElement = containerElement
    this.editable = editable
    this.group = group
    this.labelText = group.findOne('.label')
    this.square = group.findOne('.square')
    this.group.draggable(editable)
    if (editable) {
      this.registerEvents()
    }
  }

  getKonvaControl() {
    return this.group
  }

  width() {
    return this.labelText.width() + this.square.width() + 5
  }

  height() {
    return Math.max(this.labelText.height(), this.square.height())
  }

  registerEvents() {
    //reset events if any
    this.group.off('click dblclick dbltap mouseover mouseout')

    this.group.on('click', evt => {
      var curText = this.square.text()
      this.square.text(curText === "\uf14a" ? "\uf0c8" : "\uf14a")
      this.square.fill(this.square.fill() === "black" ? "green" : "black")
    })
    this.group.on('mouseover', (evt) => {
      document.body.style.cursor = 'pointer'
      this.square.shadowEnabled(true)
    })
    this.group.on('mouseout', (evt) => {
      document.body.style.cursor = 'default'
      this.square.shadowEnabled(false)
    })
    this.group.on('dragend', (evt) => {
      this.group.fire('datachange', {}, true)
    })
  }

  enableTextEditor() {
    this.group.on('dblclick dbltap', () => {
      const textPosition = this.labelText.getAbsolutePosition()
      // create textarea and style it
      const textarea = document.createElement('textarea')
      $(this.containerElement).append(textarea)

      textarea.value = this.labelText.text()
      textarea.style.position = 'absolute'
      textarea.style.top = (textPosition.y - 5) + 'px'
      textarea.style.left = (textPosition.x - 5) + 'px'
      textarea.style.width = this.labelText.width()
      textarea.focus()
      textarea.addEventListener('keydown', (evt) => {
        // hide on enter
        if (evt.keyCode === 13) {
          this.labelText.text(textarea.value)
          this.group.fire('datachange', {}, true)
          $(textarea).remove()
        }
      })
    })
  }

  static create(containerElement, groupConfig, label, fontSize) {
    const group = new Konva.Group(groupConfig)

    const labelText = new Konva.Text({
      x: fontSize + 5,
      y: 0,
      text: label,
      fontSize: fontSize,
      fill: 'black',
      name: 'label checkbox_label cloneable'
    })

    const square = new Konva.Text({
      x: 0,
      y: 0,
      text: "\uf0c8",
      fontSize: fontSize,
      fontFamily: 'FontAwesome',
      fill: 'black',
      shadowBlur: 4,
      shadowOffsetX: 2,
      shadowOffsetY: 2,
      shadowOpacity: 0.7,
      cornerRadius: 2,
      shadowEnabled: false,
      name: 'square checkbox_square cloneable'
    });
    group.add(square)
    group.add(labelText)

    const checkbox = new KonvaCheckBox(containerElement, group, true)
    checkbox.enableTextEditor()
    return checkbox
  }
}
