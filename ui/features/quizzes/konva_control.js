import Konva from 'konva'

export default class KonvaControl {
  constructor(containerElement, callback) {
    this.containerElement = containerElement
    this.stage = null
    this.callback = callback
    this.backgroundId = 'backgroundImage'
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

    this.stage.find('Circle').forEach(cir => {
      if (editable) {
        this.registerCircleNodeEvents(cir)
      }
      else {
        cir.draggable(false)
      }
    })

    this.stage.find('Text').forEach(textNode => {
      if (editable) {
        this.registerTextNodeEvents(textNode)
      }
      else {
        textNode.draggable(false)
      }
    })

    var imageObj = new Image()
    imageObj.onload = () => {
      this.stage.findOne('#' + this.backgroundId).image(imageObj)
    }
    imageObj.src = backgroundUrl
  }

  drawBackgroundWithSampleObjects(backgroundUrl, width, height) {
    this.stage = new Konva.Stage({
      container: this.containerElement,
      width: width,
      height: height,
    })

    const backgroundLayer = new Konva.Layer()
    const editableLayer = new Konva.Layer()

    editableLayer.add(this.createRedCircle('rc1', 400, 350))
    editableLayer.add(this.createRedCircle('rc2', 500, 350))
    editableLayer.add(this.createKonvaText('txt1', 150, 10, 300));
    editableLayer.add(this.createKonvaText('txt3', 220, 30, 300));
    editableLayer.add(this.createKonvaText('txt2', 40, 200, 250));

    this.stage.add(backgroundLayer)
    this.stage.add(editableLayer)
    // var source = 'http://localhost:3000/files/744/download?download_frd=1'
    // try to draw SVG natively
    Konva.Image.fromURL(backgroundUrl, (imageNode) => {
      imageNode.setAttrs({
        id: this.backgroundId,
        width: width,
        height: height,
      })
      backgroundLayer.add(imageNode)
    })
  }

  createRedCircle(id, x, y) {
    const redCircle = new Konva.Circle({
      id: id,
      x: x,
      y: y,
      radius: 10,
      fill: 'red',
      stroke: 'red',
      strokeWidth: 1,
      draggable: true,
      opacity: 0.7
    })
    this.registerCircleNodeEvents(redCircle)
    return redCircle
  }

  createKonvaText(id, x, y, width) {
    const textNode = new Konva.Text({
      id: id,
      text: 'Some text here',
      x: x,
      y: y,
      width: width,
      fontSize: 16,
      fill: 'green',
      draggable: true,
    })
    this.registerTextNodeEvents(textNode)

    return textNode
  }

  registerTextNodeEvents(textNode) {
    textNode.on('dblclick dbltap', () => {
      const textPosition = textNode.getAbsolutePosition()
      // create textarea and style it
      const textarea = document.createElement('textarea')
      $(this.containerElement).append(textarea)

      textarea.value = textNode.text()
      textarea.style.position = 'absolute'
      textarea.style.top = (textPosition.y - 5) + 'px'
      textarea.style.left = (textPosition.x - 5) + 'px'
      textarea.style.width = textNode.width()
      textarea.focus()
      textarea.addEventListener('keydown', (e) => {
        // hide on enter
        if (e.keyCode === 13) {
          textNode.text(textarea.value);
          this.callback(this.stage.toJSON())
          $(textarea).remove()
        }
      })
    })

    textNode.on('mouseover', () => {
      document.body.style.cursor = 'pointer';
    });
    textNode.on('mouseout', () => {
      document.body.style.cursor = 'default';
    })
    textNode.on('dragend', () => {
      this.callback(this.stage.toJSON())
    })
  }

  registerCircleNodeEvents(circleNode) {
    // add cursor styling
    circleNode.on('mouseover', () => {
      document.body.style.cursor = 'pointer';
    });
    circleNode.on('mouseout', () => {
      document.body.style.cursor = 'default';
    })
    circleNode.on('dragend', () => {
      this.callback(this.stage.toJSON())
    })
  }
}
