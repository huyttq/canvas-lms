import KanCheckBox from './kan_check_box'
import KanText from './kan_text'
import KanCircle from './kan_circle'
import uuid from 'uuid'

export default class KanHelper {
  static clone(containerElement, konvaNode, mousePos) {
    const newNode = konvaNode.clone({
      id: uuid(),
      x: mousePos.x + 15,
      y: mousePos.y + 15,
      draggable: true
    })

    //convert to Kan control
    if (newNode.hasName('checkbox')) {
      KanCheckBox.convert(containerElement, newNode, true).enableTextEditor()
    }
    else if (newNode.hasName('input_circle')) {
      KanCircle.convert(newNode, true)
    }
    else if (newNode.hasName('input_text')) {
      KanText.convert(containerElement, newNode, true)
    }

    return newNode
  }
}
