import {
  Assets,
  Circle,
  Container,
  type FederatedPointerEvent,
  Graphics,
  PI_2,
  Point,
  Rectangle,
  Sprite,
  Texture,
  type ViewContainer,
} from 'pixi.js'
import pixi from '@/pixi'
import { PRIMARY_COLOR } from '@/lib/constants'
import rotationIcon from '@/assets/icon-rotation.webp'
import {
  CURSOR_SEQ,
  FULL_HIT_AREA,
  RESIZE_CORNER_TRANSFORM_MODES,
  RESIZE_EDGE_TRANSFORM_MODES,
  RESIZE_TRANSFORM_MODES,
  type AnchorIndex,
  type ResizeTransformMode,
  type TransformMode,
} from './constants'

class Control {
  /**
   * The ViewContainer object associated with this control.
   */
  #obj: ViewContainer

  /**
   * The container that contains the control's graphics.
   */
  #container!: Container

  /**
   * The mask that is used to render the border of the object.
   */
  #mask!: Graphics

  /**
   * The graphics that are used to render the corner anchors.
   */
  #cornerAnchors: Graphics[] = []

  /**
   * The graphics that are used to render the edge anchors.
   */
  #edgeAnchors: Graphics[] = []

  /**
   * The sprite that is used to render the rotation anchor.
   */
  #rotationAnchor!: Sprite

  /**
   * The current transform mode of the control.
   */
  #transformMode: TransformMode | null = 'translate'

  /**
   * The pivot point that is used for transform, the value of this point is defined as the coordinates
   * of the vertices in the top left corner of the rectangle
   */
  #pivotPoint: Point | null = null

  /**
   * The initial position of the pointer event.
   */
  #startPoint: Point | null = null

  /**
   * The pivot point that is used to resize the object, this point remains unchanged
   * when the object is rotated,
   */
  #resizePivotPoint: Point | null = null

  /**
   * The rotation of the object before transformation.
   */
  #startRotation = 0

  /**
   * The width of the object before transformation.
   */
  #startWidth = 0

  /**
   * The height of the object before transformation.
   */
  #startHeight = 0

  /**
   * Initializes a new instance of the Control class.
   *
   * @param {ViewContainer} obj - The ViewContainer object associated with this control.
   * @param {FederatedPointerEvent} initialEvent - The initial pointer event that triggered the creation of this control.
   */
  constructor(obj: ViewContainer, initialEvent: FederatedPointerEvent) {
    this.#obj = obj
    this.#startPoint = initialEvent.global.clone()

    this.#createContainer()
    this.#createMask()
    this.#createCornerAnchors()
    this.#createEdgeAnchors()
    this.#createRotationAnchor()

    this.#container.emit('mousedown', initialEvent)
  }

  /**
   * Creates a container for the control and sets up event listeners for mouse interactions.
   */
  #createContainer() {
    const container = new Container({
      eventMode: 'static',
      x: this.#obj.x,
      y: this.#obj.y,
    })
    pixi.stage.addChild(container)
    this.#container = container

    container
      .on('mousedown', (e) => {
        this.#beforeTransform(e, 'translate')
      })
      .on('mousemove', (e) => {
        if (!this.#startPoint || !this.#pivotPoint) {
          return
        }
        const transformMode = this.#transformMode

        const deltaX = e.globalX - this.#startPoint.x
        const deltaY = e.globalY - this.#startPoint.y

        if (transformMode === 'translate') {
          this.#handleTranslate(deltaX, deltaY)
        } else if (
          transformMode &&
          this.#resizePivotPoint &&
          RESIZE_TRANSFORM_MODES.includes(transformMode as ResizeTransformMode)
        ) {
          this.#handleResize(deltaX, deltaY)
        } else if (transformMode === 'rotate') {
          this.#hanldeRotation(deltaX, deltaY)
        }
      })

    container.onmouseup = container.onmouseupoutside = () => {
      this.#afterTransform()
    }
  }

  /**
   * Create a mask for the container.
   */
  #createMask() {
    const mask = new Graphics({
      eventMode: 'static',
    })
    this.#container.addChild(mask)
    this.#mask = mask
  }

  /**
   * Create corner anchors for resizing.
   */
  #createCornerAnchors() {
    for (let i = 0; i < 4; i++) {
      const anchor = new Graphics({
        eventMode: 'static',
        hitArea: new Circle(0, 0, 15),
        cursor: i % 2 === 0 ? 'nwse-resize' : 'nesw-resize',
      })
        .circle(0, 0, 10)
        .fill(0xffffff)

      anchor.on('mousedown', (e) => {
        this.#beforeResize(e, i, RESIZE_CORNER_TRANSFORM_MODES[i])
      })

      this.#container.addChild(anchor)
      this.#cornerAnchors.push(anchor)
    }
  }

  /**
   * Create edge anchors for resizing.
   */
  #createEdgeAnchors() {
    for (let i = 0; i < 4; i++) {
      const anchor = new Graphics({
        eventMode: 'static',
        hitArea: new Rectangle(
          -4,
          -4,
          i % 2 === 0 ? 16 : 36,
          i % 2 === 0 ? 36 : 16
        ),
        cursor: i % 2 === 0 ? 'ew-resize' : 'ns-resize',
      })
        .roundRect(0, 0, i % 2 === 0 ? 8 : 28, i % 2 === 0 ? 28 : 8, 15)
        .fill(0xffffff)
        .stroke({ width: 1, color: 0x333333 })
        .on('mousedown', (e) => {
          this.#beforeResize(e, i, RESIZE_EDGE_TRANSFORM_MODES[i])
        })
      this.#container.addChild(anchor)
      this.#edgeAnchors.push(anchor)
    }
  }

  /**
   * Create a rotation anchor for rotating the object.
   */
  #createRotationAnchor() {
    Assets.load(rotationIcon).then((texture: Texture) => {
      const sprite = new Sprite({
        texture,
        eventMode: 'static',
        cursor: 'grab',
        width: 36,
        height: 36,
      }).on('mousedown', (e) => {
        this.#beforeRotation(e)
      })
      this.#container.addChild(sprite)
      this.#rotationAnchor = sprite

      this.#updateTransform()
    })
  }

  /**
   * Called before the object is transformed.
   *
   * @param {FederatedPointerEvent} e - The pointer event that triggered the transformation.
   * @param {TransformMode} transformMode - The type of transformation to apply.
   */
  #beforeTransform(e: FederatedPointerEvent, transformMode: TransformMode) {
    e.stopPropagation()
    this.#transformMode = transformMode
    this.#pivotPoint = this.#obj.position.clone()
    this.#startPoint = e.global.clone()
    this.#startWidth = this.#obj.width
    this.#startHeight = this.#obj.height
    this.#startRotation = this.#obj.rotation
    this.#container.hitArea = FULL_HIT_AREA
  }

  /**
   * Prepares for resizing the object by setting initial transformation properties.
   *
   * @param {FederatedPointerEvent} e - The pointer event that triggered the resize.
   * @param {number} i - The index of the corner anchor being used for resizing.
   * @param {TransformMode} transformMode - The type of transformation to apply.
   */
  #beforeResize(
    e: FederatedPointerEvent,
    i: number,
    transformMode: TransformMode
  ) {
    this.#beforeTransform(e, transformMode)
    this.#resizePivotPoint = this.#cornerAnchors[(i + 2) % 4]
      .getGlobalPosition()
      .clone()
  }

  /**
   * Called before the object is rotated.
   *
   * @param {FederatedPointerEvent} e - The pointer event that triggered the rotation.
   */
  #beforeRotation(e: FederatedPointerEvent) {
    this.#beforeTransform(e, 'rotate')

    const halfWidth = this.#startWidth / 2
    const halfHeight = this.#startHeight / 2
    const cosTheta = Math.cos(this.#startRotation)
    const sinTheta = Math.sin(this.#startRotation)

    // Calculate the center of the rectangle.
    this.#startPoint = new Point(
      this.#pivotPoint!.x + halfWidth * cosTheta - halfHeight * sinTheta,
      this.#pivotPoint!.y + halfWidth * sinTheta + halfHeight * cosTheta
    )

    // Calculate the pivot point before rotation.
    this.#pivotPoint = new Point(
      this.#pivotPoint!.x - halfWidth * (1 - cosTheta) - halfHeight * sinTheta,
      this.#pivotPoint!.y + halfWidth * sinTheta - halfHeight * (1 - cosTheta)
    )
  }

  /**
   * Called when the object is being translated.
   *
   * @param {number} deltaX - The horizontal distance to move the object.
   * @param {number} deltaY - The vertical distance to move the object.
   */
  #handleTranslate(deltaX: number, deltaY: number) {
    this.#container.position
      .set(this.#pivotPoint!.x + deltaX, this.#pivotPoint!.y + deltaY)
      .copyTo(this.#obj.position)
  }

  /**
   * Compute the sign of a determinant.
   *
   * The sign of the determinant will be negative if the points form a clockwise
   * triangle, and positive if the points form a counter-clockwise triangle.
   *
   * @param {number} x1 - The x-coordinate of the first point.
   * @param {number} y1 - The y-coordinate of the first point.
   * @param {number} x2 - The x-coordinate of the second point.
   * @param {number} y2 - The y-coordinate of the second point.
   */
  #sign(x1: number, y1: number, x2: number, y2: number) {
    const product = x1 * y2 - x2 * y1
    return Math.sign(product)
  }

  /**
   * Projects a vector onto another vector.
   *
   * @param {number} x1 - The x-coordinate of the vector to project.
   * @param {number} y1 - The y-coordinate of the vector to project.
   * @param {number} x2 - The x-coordinate of the vector to project onto.
   * @param {number} y2 - The y-coordinate of the vector to project onto.
   */
  #project(x1: number, y1: number, x2: number, y2: number) {
    const product = x1 * x2 + y1 * y2
    const mod = Math.sqrt(x2 ** 2 + y2 ** 2)
    return Math.abs(product / mod)
  }

  /**
   * Compute the new size of the object, given the positions of the 0th, 1st, and 3rd
   * corners, and the change in position of the 1st corner.
   *
   * This function assumes the object is being resized by dragging the 1st corner.
   *
   * @param {number} x0 - The x-coordinate of the 0th corner.
   * @param {number} y0 - The y-coordinate of the 0th corner.
   * @param {number} x1 - The x-coordinate of the 1st corner.
   * @param {number} y1 - The y-coordinate of the 1st corner.
   * @param {number} x3 - The x-coordinate of the 3rd corner.
   * @param {number} y3 - The y-coordinate of the 3rd corner.
   * @param {number} deltaX - The horizontal distance to move the 1st corner.
   * @param {number} deltaY - The vertical distance to move the 1st corner.
   */
  #calcNewSizeByCorner(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    x3: number,
    y3: number,
    deltaX: number,
    deltaY: number
  ) {
    const sign = this.#sign(x3 - x1, y3 - y1, deltaX, deltaY)
    const d = this.#project(deltaX, deltaY, x3 - x0, y3 - y0)

    const width = this.#startWidth + d * sign
    const height = width / (this.#startWidth / this.#startHeight)

    return [width, height]
  }

  /**
   * Calculates the new size of the object when resizing by an edge.
   *
   * This function computes the new width or height of the object based on
   * the change in position of an edge anchor. The calculation takes into
   * account the initial positions of the corners, the change in position
   * of the edge, and the index of the edge anchor.
   *
   * @param {number} x0 - The x-coordinate of the 0th corner.
   * @param {number} y0 - The y-coordinate of the 0th corner.
   * @param {number} x1 - The x-coordinate of the 1st corner.
   * @param {number} y1 - The y-coordinate of the 1st corner.
   * @param {number} x3 - The x-coordinate of the 3rd corner.
   * @param {number} y3 - The y-coordinate of the 3rd corner.
   * @param {number} deltaX - The horizontal distance to move the edge.
   * @param {number} deltaY - The vertical distance to move the edge.
   * @param {AnchorIndex} i - The index of the edge anchor.
   */
  #calcNewSizeByEdge(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    x3: number,
    y3: number,
    deltaX: number,
    deltaY: number,
    i: AnchorIndex
  ) {
    const sign = this.#sign(x3 - x0, y3 - y0, deltaX, deltaY)
    const d = this.#project(deltaX, deltaY, x1 - x0, y1 - y0)

    if (i % 2 === 0) {
      const width = this.#startWidth + d * sign
      return [width, this.#startHeight]
    } else {
      const height = this.#startHeight + d * sign
      return [this.#startWidth, height]
    }
  }

  /**
   * Handles the resizing of the object by adjusting its width and height
   * based on the given delta values. It updates the object's size and
   * position to reflect the new dimensions.
   *
   * @param {number} deltaX - The change in the x-coordinate for resizing.
   * @param {number} deltaY - The change in the y-coordinate for resizing.
   */
  #handleResize(deltaX: number, deltaY: number) {
    const anchors = this.#cornerAnchors

    const i = (RESIZE_TRANSFORM_MODES.indexOf(
      this.#transformMode as ResizeTransformMode
    ) % 4) as AnchorIndex

    const { x: x0, y: y0 } = anchors[i].getGlobalPosition()
    const { x: x1, y: y1 } = anchors[(i + 1) % 4].getGlobalPosition()
    const { x: x3, y: y3 } = anchors[(i + 3) % 4].getGlobalPosition()

    let width: number
    let height: number
    if (RESIZE_CORNER_TRANSFORM_MODES.includes(this.#transformMode! as any)) {
      // prettier-ignore
      [width, height] = this.#calcNewSizeByCorner(x0,y0,x1,y1,x3,y3, deltaX, deltaY)
    } else {
      // prettier-ignore
      [width, height] = this.#calcNewSizeByEdge(x0,y0,x1,y1,x3,y3, deltaX, deltaY, i)
    }

    this.#obj.setSize(width, height)
    this.#updateTransform()

    const { x: xr, y: yr } = this.#resizePivotPoint!
    const { x: x2, y: y2 } = anchors[(i + 2) % 4].getGlobalPosition()

    this.#container.position
      .set(this.#pivotPoint!.x - (x2 - xr), this.#pivotPoint!.y - (y2 - yr))
      .copyTo(this.#obj.position)
    this.#pivotPoint = this.#container.position.clone()
  }

  /**
   * Handles the rotation of the object by adjusting its rotation value
   * based on the given delta values. It updates the object's rotation and
   * position to reflect the new angle.
   *
   * @param {number} deltaX - The change in the x-coordinate for rotation.
   * @param {number} deltaY - The change in the y-coordinate for rotation.
   */
  #hanldeRotation(deltaX: number, deltaY: number) {
    const theta = Math.atan2(deltaY, deltaX) - Math.PI / 2

    this.#obj.rotation = theta
    this.#container.rotation = theta

    const halfWidth = this.#startWidth / 2
    const halfHeight = this.#startHeight / 2
    const cosTheta = Math.cos(theta)
    const sinTheta = Math.sin(theta)
    this.#container.position
      .set(
        // prettier-ignore
        this.#pivotPoint!.x + halfWidth * (1 - cosTheta) + halfHeight * sinTheta,
        // prettier-ignore
        this.#pivotPoint!.y - halfWidth * sinTheta + halfHeight * (1 - cosTheta)
      )
      .copyTo(this.#obj.position)
  }

  /**
   * Updates the transform properties of the object, including its size, mask,
   * and the positions of corner and edge anchors. Adjusts the rotation anchor
   * position based on the current width and height of the object.
   */
  #updateTransform() {
    const { width, height } = this.#obj.getSize()

    this.#mask
      .clear()
      .rect(-2, -2, width + 4, height + 4)
      .fill('transparent')
      .stroke({ width: 4, color: PRIMARY_COLOR })

    this.#cornerAnchors.forEach((anchor, i) => {
      anchor.position.set(
        i === 0 || i === 3 ? 0 : width,
        i === 0 || i === 1 ? 0 : height
      )
    })

    this.#edgeAnchors.forEach((anchor, i) => {
      anchor.position.set(
        // prettier-ignore
        (i === 0 ? 0 : i === 2 ? 1 : 0.5) * width + (i === 0 ? -6 : i === 2 ? -2 : -14),
        // prettier-ignore
        (i === 1 ? 0 : i === 3 ? 1 : 0.5) * height + (i === 1 ? -6 : i === 3 ? -2 : -14)
      )
    })

    this.#rotationAnchor.position.set(width / 2 - 18, height + 20)
  }

  /**
   * Finalizes the transformation process by updating cursor styles based on
   * the object's current rotation, if the transformation mode was 'rotate'.
   * Resets transformation state variables, including the transform mode,
   * pivot point, start point, and container's hit area.
   */
  #afterTransform() {
    if (this.#transformMode === 'rotate') {
      let theta = this.#obj.rotation
      if (theta < 0) {
        theta += PI_2
      }
      const offset = Math.ceil(Math.floor(theta / (PI_2 / 16)) / 2)
      this.#cornerAnchors.forEach((anchor, i) => {
        anchor.cursor = CURSOR_SEQ[(i * 2 + offset) % 8]
      })
      this.#edgeAnchors.forEach((anchor, i) => {
        anchor.cursor = CURSOR_SEQ[(i * 2 + 7 + offset) % 8]
      })
    }

    this.#transformMode = null
    this.#pivotPoint = null
    this.#startPoint = null
    this.#container.hitArea = null
  }

  /**
   * Destroys the control container and all of its children, effectively
   * removing the control from the stage.
   */
  destroy() {
    this.#container.destroy({ children: true })
  }
}

export default Control
