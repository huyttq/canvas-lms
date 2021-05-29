import Konva from 'konva'
import uuid from 'uuid'
import KonvaCheckBox from './konva_check_box'

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
      if (editable) {
        this.registerCircleNodeEvents(cir)
      } else {
        cir.draggable(false)
      }
    })
    editableLayer.find('.input_text').forEach(textNode => {
      if (editable) {
        this.registerTextNodeEvents(textNode)
      } else {
        textNode.draggable(false)
      }
    })
    editableLayer.find('.checkbox').forEach(groupNode => {
      new KonvaCheckBox(this.containerElement, groupNode, editable)
    })

    if (editable) {
      const tooltipLayer = new Konva.Layer()
      tooltipLayer.add(this.tooltip)
      this.stage.add(tooltipLayer)
    }
  }

  drawBackgroundWithSampleObjects(backgroundUrl, width, height) {
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

    editableLayer.add(this.createRedCircle(400, 350))
    editableLayer.add(this.createRedCircle(500, 350))
    editableLayer.add(this.createKonvaText(150, 10, 300))
    editableLayer.add(this.createKonvaText(40, 200, 250))
    editableLayer.add(this.createKonvaText(220, 30, 300))
    const checkbox = KonvaCheckBox.create(
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
    editableLayer.add(checkbox.getKonvaControl())

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

  createRedCircle(x, y) {
    const redCircle = new Konva.Circle({
      id: uuid(),
      x,
      y,
      radius: 10,
      fill: 'red',
      stroke: 'red',
      strokeWidth: 1,
      draggable: true,
      opacity: 0.7,
      name: 'cloneable input_circle'
    })
    this.registerCircleNodeEvents(redCircle)
    return redCircle
  }

  createKonvaText(x, y, width) {
    const textNode = new Konva.Text({
      id: uuid(),
      text: 'Enter some text',
      x,
      y,
      width,
      fontSize: 14,
      fill: 'green',
      draggable: true,
      name: 'transformable cloneable input_text'
    })
    this.registerTextNodeEvents(textNode)

    return textNode
  }

  registerTextNodeEvents(textNode) {
    textNode.off('dblclick dbltap')
    textNode.on('dblclick dbltap', () => {
      const textPosition = textNode.getAbsolutePosition()
      // create textarea and style it
      const textarea = document.createElement('textarea')
      $(this.containerElement).append(textarea)

      textarea.value = textNode.text()
      textarea.style.position = 'absolute'
      textarea.style.top = textPosition.y - 5 + 'px'
      textarea.style.left = textPosition.x - 5 + 'px'
      textarea.style.width = textNode.width()
      textarea.focus()
      textarea.addEventListener('keydown', evt => {
        // hide on enter
        if (evt.keyCode === 13) {
          textNode.text(textarea.value)
          textNode.fire('datachange', {}, true)
          $(textarea).remove()
        }
      })
    })

    textNode.on('mouseover', evt => {
      document.body.style.cursor = 'pointer'
      const mousePos = this.stage.getPointerPosition()
      this.tooltip.position({
        x: mousePos.x + 5,
        y: mousePos.y + 5
      })
      this.tooltipText.text('Double click to edit then press Enter')
      this.tooltip.show()
    })
    textNode.on('mouseout', evt => {
      document.body.style.cursor = 'default'
      this.tooltip.hide()
    })
    textNode.on('dragstart', evt => {
      this.tooltip.hide()
    })
    textNode.on('dragend', evt => {
      // this.callback(this.stage.toJSON())
      textNode.fire('datachange', {}, true)
    })

    textNode.on('transform', () => {
      // with enabled anchors we can only change scaleX
      // so we don't need to reset height
      // just width
      textNode.setAttrs({
        width: Math.max(textNode.width() * textNode.scaleX(), this.MIN_WIDTH),
        scaleX: 1,
        scaleY: 1
      })
    })

    textNode.dragBoundFunc(pos => {
      return this.dragBoundFunc(pos, textNode.width(), textNode.height())
    })
  }

  registerCircleNodeEvents(circleNode) {
    circleNode.off('dblclick dbltap')

    // add cursor styling
    circleNode.on('dragstart', evt => {
      this.tooltip.hide()
    })
    circleNode.on('dragend', evt => {
      circleNode.fire('datachange', {}, true)
    })
    circleNode.on('mouseover', evt => {
      const shape = evt.target
      shape.scaleX(1.2)
      shape.scaleY(1.2)
      document.body.style.cursor = 'pointer'

      const mousePos = this.stage.getPointerPosition()
      this.tooltip.position({
        x: mousePos.x + 5,
        y: mousePos.y + 5
      })
      this.tooltipText.text('Drag the circle to the body position')
      this.tooltip.show()
    })
    circleNode.on('mouseout', evt => {
      const shape = evt.target
      document.body.style.cursor = 'default'
      shape.scaleX(1)
      shape.scaleY(1)
      this.tooltip.hide()
    })

    circleNode.dragBoundFunc(pos => {
      return this.dragBoundFunc(pos, circleNode.width() / 2, circleNode.height() / 2)
    })
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
          let clone = this.currentShape.clone({
            id: uuid(),
            x: mousePos.x + 15,
            y: mousePos.y + 15,
            draggable: true
          })
          const editableLayer = this.stage.findOne(`#${this.editableLayerId}`)
          if (this.currentShape.hasName('tranformable')) {
            editableLayer.add(this.createTransformer(clone))
          }
          if (this.currentShape.hasName('checkbox')) {
            const checkbox = new KonvaCheckBox(this.containerElement, clone, true)
            checkbox.enableTextEditor()
            clone = checkbox.getKonvaControl()
          } else if (this.currentShape.className === 'Circle') {
            this.registerCircleNodeEvents(clone)
          } else if (this.currentShape.className === 'Text') {
            this.registerTextNodeEvents(clone)
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

    const editableLayer = this.stage.find(`#${this.editableLayerId}`)[0]
    editableLayer.find('.transformable').forEach(textNode => {
      editableLayer.add(this.createTransformer(textNode))
    })
  }
}
