import Konva from 'konva'
import KanCheckBox from './kan_check_box'
import KanText from './kan_text'
import KanCircle from './kan_circle'
import KanHelper from './kan_helper'

export default class KonvaControl {
  constructor(containerElement, callback) {
    this.containerElement = containerElement
    this.stage = null
    this.callback = callback
    this.backgroundId = 'backgroundImage'
    this.editableLayerId = 'editableLayer'
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

    // context menu
    this.currentShape = null

    this.MIN_WIDTH = 20
  }

  clear() {
    if (this.stage) {
      this.stage.clear()
    }
  }

  draw(backgroundUrl, ksonData, editable) {
    if (!backgroundUrl) {
      console.log('background url is null')
      return
    }
    if (!ksonData) {
      console.log('ksonData url is null')
      return
    }

    this.stage = Konva.Node.create(ksonData, this.containerElement)
    this.stage.on('datachange', evt => {
      this.callback(this.stage.toJSON())
    })

    const imageObj = new Image()
    imageObj.onload = () => {
      this.stage.findOne('#' + this.backgroundId).image(imageObj)
    }
    imageObj.src = backgroundUrl

    const editableLayer = this.stage.findOne(`#${this.editableLayerId}`)
    editableLayer.find('.input_circle').forEach(cir => {
      KanCircle.convert(cir, editable)
    })
    editableLayer.find('.input_text').forEach(textNode => {
      KanText.convert(this.containerElement, textNode, editable)
    })
    editableLayer.find('.checkbox').forEach(groupNode => {
      KanCheckBox.convert(this.containerElement, groupNode, editable)
    })

    if (editable) {
      const tooltipLayer = new Konva.Layer()
      tooltipLayer.add(this.tooltip)
      this.stage.add(tooltipLayer)
    }
  }

  drawBackgroundWithSampleObjects(backgroundUrl, width, height) {
    if (this.stage) {
      this.stage.clear()
    }
    this.stage = new Konva.Stage({
      container: this.containerElement,
      width,
      height
    })
    this.stage.on('datachange', evt => {
      this.callback(this.stage.toJSON())
    })

    const backgroundLayer = new Konva.Layer()
    const editableLayer = new Konva.Layer({
      id: this.editableLayerId
    })
    const tooltipLayer = new Konva.Layer()

    editableLayer.add(this.createCircleInput(400, 350))
    editableLayer.add(this.createCircleInput(500, 350))
    editableLayer.add(this.createTextInput(150, 10, 300))
    editableLayer.add(this.createTextInput(40, 200, 250))
    editableLayer.add(this.createTextInput(220, 30, 300))
    editableLayer.add(this.createCheckbox())

    this.stage.add(backgroundLayer)
    this.stage.add(editableLayer)
    tooltipLayer.add(this.tooltip)
    this.stage.add(tooltipLayer)
    // http://localhost:3000/files/744/download?download_frd=1
    // try to draw SVG natively
    Konva.Image.fromURL(backgroundUrl, imageNode => {
      imageNode.setAttrs({
        id: this.backgroundId,
        width,
        height
      })
      backgroundLayer.add(imageNode)
    })
  }

  createCircleInput(x, y) {
    const kanCircle = KanCircle.create({
      x,
      y,
      fill: 'red',
      stroke: 'red',
      dragBoundFunc: pos => {
        return this.dragBoundFunc(pos, kanCircle.width(), kanCircle.height())
      }
    })
    return kanCircle.toKonvaNode()
  }

  createTextInput(x, y, width) {
    const kanText = KanText.create(this.containerElement, {
      x,
      y,
      width,
      dragBoundFunc: pos => {
        return this.dragBoundFunc(pos, kanText.width(), kanText.height())
      }
    })
    return kanText.toKonvaNode()
  }

  createCheckbox() {
    const checkbox = KanCheckBox.create(
      this.containerElement,
      {
        id: 'chk1',
        x: 100,
        y: 300,
        name: 'cloneable checkbox',
        dragBoundFunc: pos => {
          return this.dragBoundFunc(pos, checkbox.width(), checkbox.height())
        }
      },
      'Hello world!',
      16
    )
    return checkbox.toKonvaNode()
  }

  dragBoundFunc(pos, shapeWidth, shapeHeight) {
    // console.log(`drag event ${shapeWidth} ${this.stage.width()}`)
    const maxX = this.stage.width() - shapeWidth
    const maxY = this.stage.height() - shapeHeight
    let newX = pos.x > maxX ? maxX : pos.x
    newX = newX < 0 ? 0 : newX

    let newY = pos.y > maxY ? maxY : pos.y
    newY = newY < 0 ? 0 : newY
    return {
      x: newX,
      y: newY
    }
  }

  addContextMenu() {
    if (!this.stage) return
    this.stage.on('contextmenu', e => {
      // prevent default behavior
      e.evt.preventDefault()
      const shapeType = e.target.className
      if (shapeType !== 'Circle' && shapeType !== 'Text') {
        // if we are on empty place of the stage we will do nothing
        return
      }
      this.currentShape = e.target
      if (
        this.currentShape.hasName('checkbox_label') ||
        this.currentShape.hasName('checkbox_square')
      ) {
        this.currentShape = this.currentShape.parent
      }
      // show menu
      const mousePos = this.stage.getPointerPosition()
      const $menuNode = $('#konva_context_menu')
      $menuNode.css('top', mousePos.y + 40 + 'px')
      $menuNode.css('left', mousePos.x + 4 + 'px')
      $menuNode.show()

      const events = $.data($('#konva_context_menu_delete').get(0), 'events')
      if (!events || !events.click) {
        $('#konva_context_menu_delete').click(evt => {
          evt.preventDefault()
          this.currentShape.transformsEnabled('none')
          this.currentShape.destroy()
          $('#konva_context_menu').hide()
        })
      }

      const cloneEvents = $.data($('#konva_context_menu_clone').get(0), 'events')
      if (!cloneEvents || !cloneEvents.click) {
        $('#konva_context_menu_clone').click(evt => {
          evt.preventDefault()
          if (!this.currentShape.hasName('cloneable')) return

          const mousePos = this.stage.getPointerPosition()
          const clone = KanHelper.clone(this.containerElement, this.currentShape, mousePos)
          const editableLayer = this.stage.findOne(`#${this.editableLayerId}`)
          if (this.currentShape.hasName('tranformable')) {
            editableLayer.add(this.createTransformer(clone))
          }
          editableLayer.add(clone)

          $('#konva_context_menu').hide()
        })
      }
    })

    window.addEventListener('click', () => {
      // hide menu
      $('#konva_context_menu').hide()
    })
  }

  createTransformer(node) {
    return new Konva.Transformer({
      nodes: [node],
      padding: 5,
      rotateEnabled: false,
      // enable only side anchors
      enabledAnchors: ['middle-left', 'middle-right'],
      // limit transformer size
      boundBoxFunc: (oldBox, newBox) => {
        if (newBox.width < this.MIN_WIDTH) {
          return oldBox
        }
        return newBox
      }
    })
  }

  addTransformer() {
    if (!this.stage) return

    const editableLayer = this.stage.findOne(`#${this.editableLayerId}`)
    editableLayer.find('.transformable').forEach(node => {
      editableLayer.add(this.createTransformer(node))
    })
  }
}
