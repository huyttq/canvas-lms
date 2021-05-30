/*
 * Copyright (C) 2021 - present Instructure, Inc.
 *
 * This file is part of Canvas.
 *
 * Canvas is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, version 3 of the License.
 *
 * Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with this program. If not, see <http://www.gnu.org/licenses/>.
 */

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

    // convert to Kan control
    if (newNode.hasName('checkbox')) {
      const checkbox = KanCheckBox.convert(containerElement, newNode, true)
      checkbox.enableTextEditor()
      checkbox.toKonvaNode().dragBoundFunc(pos => {
        return KanHelper.dragBoundFunc(
          pos,
          checkbox.width(),
          checkbox.height(),
          stage.width(),
          stage.height()
        )
      })
    } else if (newNode.hasName('input_circle')) {
      KanCircle.convert(newNode, false)
      newNode.dragBoundFunc(pos => {
        return KanHelper.dragBoundFunc(
          pos,
          newNode.width(),
          newNode.height(),
          stage.width(),
          stage.height()
        )
      })
    } else if (newNode.hasName('input_text')) {
      KanText.convert(containerElement, newNode, true)
      newNode.dragBoundFunc(pos => {
        return KanHelper.dragBoundFunc(
          pos,
          newNode.width(),
          newNode.height(),
          stage.width(),
          stage.height()
        )
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
