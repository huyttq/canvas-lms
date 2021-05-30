import Konva from 'konva'

export default class KanTooltip {
  constructor(layer) {
    this.tooltipText = new Konva.Text({
      text: '',
      fontFamily: 'Calibri',
      fontSize: 12,
      padding: 5,
      fill: 'black'
    })

    this.tooltip = new Konva.Label({
      x: 180,
      y: 150,
      opacity: 0.75,
      visible: false
    })

    this.tooltip.add(
      new Konva.Tag({
        fill: 'yellow'
      })
    )
    this.tooltip.add(this.tooltipText)
    layer.add(this.tooltip)
  }

  show(message, mousePos) {
    this.tooltip.position({
      x: mousePos.x + 5,
      y: mousePos.y + 5
    })
    this.tooltipText.text(message)
    this.tooltip.show()
  }

  hide() {
    this.tooltip.hide()
  }
}
