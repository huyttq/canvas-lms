import Konva from 'konva'
import KanCheckBox from './kan_check_box'
import KanText from './kan_text'
import KanCircle from './kan_circle'
import KanHelper from './kan_helper'
import KanTooltip from './kan_tooltip'

export default class KonvaControl {
  constructor(containerElement, callback) {
    this.containerElement = containerElement
    this.stage = null
    this.callback = callback
    this.backgroundId = 'backgroundImage'
    this.editableLayerId = 'editableLayer'
    this.tooltip = null
    // context menu
    this.currentShape = null
    this.MIN_WIDTH = 20
  }

  clear() {
    if (this.stage) {
      this.stage.clear()
    }
  }

  draw(backgroundUrl, ksonData, editable, readonly) {
    if (!backgroundUrl) {
      console.log('background url is null')
      return
    }
    if (!ksonData) {
      console.log('ksonData url is null')
      return
    }

    this.stage = Konva.Node.create(ksonData, this.containerElement)

    const imageObj = new Image()
    imageObj.onload = () => {
      this.stage.findOne('#' + this.backgroundId).image(imageObj)
      const $wrapperEle = $('.illustrating_editor')
      const scale = $wrapperEle.width()/this.stage.width()
      if (scale < 1) {
        this.stage.scale({ x: scale, y: scale})
      }
    }
    imageObj.src = backgroundUrl

    const editableLayer = this.stage.findOne(`#${this.editableLayerId}`)
    editableLayer.find('.input_circle').forEach(cir => {
      KanCircle.convert(cir, readonly)
    })
    editableLayer.find('.input_text').forEach(textNode => {
      KanText.convert(this.containerElement, textNode, editable, readonly)
    })
    editableLayer.find('.checkbox').forEach(groupNode => {
      KanCheckBox.convert(this.containerElement, groupNode, editable, readonly)
    })

    const tooltipLayer = new Konva.Layer()
    this.tooltip = new KanTooltip(tooltipLayer)
    this.stage.add(tooltipLayer)
    this.tooltip.hide()
    this.registerEvents()
  }

  drawBackgroundWithSampleObjects(backgroundUrl) {
    if (this.stage) {
      this.stage.clear()
    }
    this.stage = new Konva.Stage({
      container: this.containerElement,
      width: 100, //not matter but drawImage requires
      height: 100
    })

    const backgroundLayer = new Konva.Layer()
    const editableLayer = new Konva.Layer({
      id: this.editableLayerId
    })

    editableLayer.add(this.createCircleInput(400, 350))
    editableLayer.add(this.createCircleInput(500, 350))
    editableLayer.add(this.createTextInput(150, 10, 300))
    editableLayer.add(this.createTextInput(40, 200, 250))
    editableLayer.add(this.createTextInput(220, 30, 300))
    editableLayer.add(this.createCheckbox())

    this.stage.add(backgroundLayer)
    this.stage.add(editableLayer)

    const tooltipLayer = new Konva.Layer()
    this.tooltip = new KanTooltip(tooltipLayer)
    this.stage.add(tooltipLayer)

    this.registerEvents()
    // http://localhost:3000/files/744/download?download_frd=1
    // try to draw SVG natively
    Konva.Image.fromURL(backgroundUrl, imageNode => {
      imageNode.setAttrs({
        id: this.backgroundId
      })
      backgroundLayer.add(imageNode)
      const $wrapperEle = $('.illustrating_editor')
      const scale = $wrapperEle.width() / imageNode.width()
      const stageWidth = scale < 1 ? imageNode.width() * scale : imageNode.width()
      const stageHeight = scale < 1 ? imageNode.height() * scale : imageNode.height()
      this.stage.width(stageWidth)
      this.stage.height(stageHeight)
    })
  }

  createCircleInput(x, y) {
    const kanCircle = KanCircle.create({
      x,
      y,
      fill: 'red',
      stroke: 'red',
      dragBoundFunc: pos => {
        return KanHelper.dragBoundFunc(pos, kanCircle.width(), kanCircle.height(), this.stage.width(), this.stage.height())
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
        return KanHelper.dragBoundFunc(pos, kanText.width(), kanText.height(), this.stage.width(), this.stage.height())
      }
    })
    return kanText.toKonvaNode()
  }

  createCheckbox() {
    const checkbox = KanCheckBox.create(
      this.containerElement,
      {
        x: 100,
        y: 300,
        name: 'cloneable checkbox',
        dragBoundFunc: pos => {
          return KanHelper.dragBoundFunc(pos, checkbox.width(), checkbox.height(), this.stage.width(), this.stage.height())
        }
      },
      'Hello world!',
      16
    )
    return checkbox.toKonvaNode()
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
          this.stage.fire('datachange')
          $('#konva_context_menu').hide()
        })
      }

      const cloneEvents = $.data($('#konva_context_menu_clone').get(0), 'events')
      if (!cloneEvents || !cloneEvents.click) {
        $('#konva_context_menu_clone').click(evt => {
          evt.preventDefault()
          if (!this.currentShape.hasName('cloneable')) return

          const mousePos = this.stage.getPointerPosition()
          const clone = KanHelper.clone(this.containerElement, this.stage, this.currentShape, mousePos)
          const editableLayer = this.stage.findOne(`#${this.editableLayerId}`)
          if (this.currentShape.hasName('transformable')) {
            editableLayer.add(this.createTransformer(clone))
          }
          editableLayer.add(clone)
          this.stage.fire('datachange')
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

  registerEvents() {
    this.stage.on('datachange', evt => {
      this.callback(this.stage.toJSON())
    })

    this.stage.on('showtooltip', evt => {
      this.tooltip.show(evt.message, this.stage.getPointerPosition())
    })

    this.stage.on('hidetooltip', evt => {
      this.tooltip.hide()
    })
  }
}
