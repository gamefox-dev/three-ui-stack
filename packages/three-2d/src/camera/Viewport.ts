import type { OrthographicCamera } from 'three'
import { createOrthographicCamera, updateOrthographicCamera } from './OrthographicCamera'

export interface Vec2Like {
  x: number
  y: number
}

/** Structural subset of a Three renderer needed to apply a viewport. */
export interface ViewportRenderer {
  setViewport(x: number, y: number, width: number, height: number): void
}

/**
 * Maps a virtual world size onto the screen (libGDX style). Screen coordinates are logical pixels
 * with the origin at the top-left. Subclasses implement the scaling policy in `compute()`.
 */
export abstract class Viewport {
  readonly camera: OrthographicCamera
  worldWidth: number
  worldHeight: number
  screenX = 0
  screenY = 0
  screenWidth = 0
  screenHeight = 0
  readonly yDown: boolean

  constructor(worldWidth: number, worldHeight: number, camera?: OrthographicCamera, yDown = true) {
    this.worldWidth = worldWidth
    this.worldHeight = worldHeight
    this.yDown = yDown
    this.camera = camera ?? createOrthographicCamera(worldWidth, worldHeight, yDown)
  }

  protected abstract compute(screenWidth: number, screenHeight: number): void

  /** Recompute screen rect / world size after a resize. */
  update(screenWidth: number, screenHeight: number, centerCamera = false): void {
    this.compute(screenWidth, screenHeight)
    this.apply(centerCamera)
  }

  /** Push world size to the camera. */
  apply(centerCamera = false): void {
    updateOrthographicCamera(this.camera, this.worldWidth, this.worldHeight, this.yDown, centerCamera)
  }

  /** Restrict rendering to the viewport rectangle (letterboxing) on a renderer. */
  applyTo(renderer: ViewportRenderer): void {
    renderer.setViewport(this.screenX, this.screenY, this.screenWidth, this.screenHeight)
  }

  /** Screen (logical px, top-left origin) → world. */
  unproject(screenX: number, screenY: number, out: Vec2Like = { x: 0, y: 0 }): Vec2Like {
    const zoom = this.camera.zoom || 1
    const nx = this.screenWidth ? (screenX - this.screenX) / this.screenWidth : 0
    const ny = this.screenHeight ? (screenY - this.screenY) / this.screenHeight : 0
    out.x = this.camera.position.x + (nx - 0.5) * (this.worldWidth / zoom)
    out.y = this.camera.position.y + (this.yDown ? ny - 0.5 : 0.5 - ny) * (this.worldHeight / zoom)
    return out
  }

  /** World → screen (logical px, top-left origin). */
  project(worldX: number, worldY: number, out: Vec2Like = { x: 0, y: 0 }): Vec2Like {
    const zoom = this.camera.zoom || 1
    const nx = (worldX - this.camera.position.x) / (this.worldWidth / zoom) + 0.5
    const dy = (worldY - this.camera.position.y) / (this.worldHeight / zoom)
    const ny = this.yDown ? dy + 0.5 : 0.5 - dy
    out.x = this.screenX + nx * this.screenWidth
    out.y = this.screenY + ny * this.screenHeight
    return out
  }
}

/** World is stretched to the full screen, ignoring aspect ratio. */
export class StretchViewport extends Viewport {
  protected compute(sw: number, sh: number): void {
    this.screenX = 0
    this.screenY = 0
    this.screenWidth = sw
    this.screenHeight = sh
  }
}

/** Keep aspect ratio; scale to fit entirely inside the screen (letterbox bars). */
export class FitViewport extends Viewport {
  protected compute(sw: number, sh: number): void {
    const scale = Math.min(sw / this.worldWidth, sh / this.worldHeight)
    this.screenWidth = Math.round(this.worldWidth * scale)
    this.screenHeight = Math.round(this.worldHeight * scale)
    this.screenX = Math.floor((sw - this.screenWidth) / 2)
    this.screenY = Math.floor((sh - this.screenHeight) / 2)
  }
}

/** Keep aspect ratio; scale to cover the screen (edges cropped). */
export class FillViewport extends Viewport {
  protected compute(sw: number, sh: number): void {
    const scale = Math.max(sw / this.worldWidth, sh / this.worldHeight)
    this.screenWidth = Math.round(this.worldWidth * scale)
    this.screenHeight = Math.round(this.worldHeight * scale)
    this.screenX = Math.floor((sw - this.screenWidth) / 2)
    this.screenY = Math.floor((sh - this.screenHeight) / 2)
  }
}

/**
 * Keeps at least `minWorldWidth × minWorldHeight` visible and extends the world along one axis
 * to fill the screen. Optional max sizes introduce letterbox bars once reached.
 */
export class ExtendViewport extends Viewport {
  readonly minWorldWidth: number
  readonly minWorldHeight: number
  readonly maxWorldWidth: number
  readonly maxWorldHeight: number

  constructor(minWorldWidth: number, minWorldHeight: number, maxWorldWidth = 0, maxWorldHeight = 0, camera?: OrthographicCamera, yDown = true) {
    super(minWorldWidth, minWorldHeight, camera, yDown)
    this.minWorldWidth = minWorldWidth
    this.minWorldHeight = minWorldHeight
    this.maxWorldWidth = maxWorldWidth
    this.maxWorldHeight = maxWorldHeight
  }

  protected compute(sw: number, sh: number): void {
    let worldWidth = this.minWorldWidth
    let worldHeight = this.minWorldHeight
    const scale = Math.min(sw / worldWidth, sh / worldHeight)
    let viewportWidth = Math.round(worldWidth * scale)
    let viewportHeight = Math.round(worldHeight * scale)
    if (viewportWidth < sw) {
      const toViewport = viewportHeight / worldHeight
      const toWorld = worldHeight / viewportHeight
      let lengthen = (sw - viewportWidth) * toWorld
      if (this.maxWorldWidth > 0) lengthen = Math.min(lengthen, this.maxWorldWidth - this.minWorldWidth)
      worldWidth += lengthen
      viewportWidth += Math.round(lengthen * toViewport)
    } else if (viewportHeight < sh) {
      const toViewport = viewportWidth / worldWidth
      const toWorld = worldWidth / viewportWidth
      let lengthen = (sh - viewportHeight) * toWorld
      if (this.maxWorldHeight > 0) lengthen = Math.min(lengthen, this.maxWorldHeight - this.minWorldHeight)
      worldHeight += lengthen
      viewportHeight += Math.round(lengthen * toViewport)
    }
    this.worldWidth = worldWidth
    this.worldHeight = worldHeight
    this.screenWidth = viewportWidth
    this.screenHeight = viewportHeight
    this.screenX = Math.floor((sw - viewportWidth) / 2)
    this.screenY = Math.floor((sh - viewportHeight) / 2)
  }
}

/** One world unit == `unitsPerPixel` screen pixels; world size follows the screen. */
export class ScreenViewport extends Viewport {
  unitsPerPixel = 1

  constructor(camera?: OrthographicCamera, yDown = true) {
    super(1, 1, camera, yDown)
  }

  protected compute(sw: number, sh: number): void {
    this.screenX = 0
    this.screenY = 0
    this.screenWidth = sw
    this.screenHeight = sh
    this.worldWidth = sw * this.unitsPerPixel
    this.worldHeight = sh * this.unitsPerPixel
  }
}
