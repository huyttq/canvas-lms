import KanCheckBox from './kan_check_box'
import KanText from './kan_text'
import KanCircle from './kan_circle'
import uuid from 'uuid'

export default class KanHelper {
  static clone(containerElement, stage, konvaNode, mousePos) {
    const newNode = konvaNode.clone({
      id: uuid(),
      x: mousePos.x + 15,
      y: mousePos.y + 15,
      draggable: true
    })

    //convert to Kan control
    if (newNode.hasName('checkbox')) {
      const checkbox = KanCheckBox.convert(containerElement, newNode, true)
      checkbox.enableTextEditor()
      checkbox.toKonvaNode().dragBoundFunc(pos => {
        return KanHelper.dragBoundFunc(pos, checkbox.width(), checkbox.height(), stage.width(), stage.height())
      })
    }
    else if (newNode.hasName('input_circle')) {
      KanCircle.convert(newNode, true)
      newNode.dragBoundFunc(pos => {
        return KanHelper.dragBoundFunc(pos, newNode.width(), newNode.height(), stage.width(), stage.height())
      })
    }
    else if (newNode.hasName('input_text')) {
      KanText.convert(containerElement, newNode, true)
      newNode.dragBoundFunc(pos => {
        return KanHelper.dragBoundFunc(pos, newNode.width(), newNode.height(), stage.width(), stage.height())
      })
    }

    return newNode
  }

  static dragBoundFunc(pos, shapeWidth, shapeHeight, stageWidth, stageHeight) {
    // console.log(`drag event ${shapeWidth} ${stageWidth}`)
    const maxX = stageWidth - shapeWidth
    const maxY = stageHeight - shapeHeight
    let newX = pos.x > maxX ? maxX : pos.x
    newX = newX < 0 ? 0 : newX

    let newY = pos.y > maxY ? maxY : pos.y
    newY = newY < 0 ? 0 : newY
    return {
      x: newX,
      y: newY
    }
  }
}
