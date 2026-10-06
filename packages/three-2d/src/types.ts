/** Anything that owns GPU or other manually-released resources. `dispose()` must be idempotent. */
export interface Disposable {
  dispose(): void
}

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Accepted color inputs.
 * - `number`: `0xRRGGBB` (opaque)
 * - `string`: `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`, `rgb()`, `rgba()`, `hsl()`, `hsla()`, basic names
 * - object / tuple with 0..1 float channels (sRGB)
 */
export type ColorLike =
  | number
  | string
  | { r: number; g: number; b: number; a?: number }
  | readonly [number, number, number, number?]

export type BlendMode = 'normal' | 'additive' | 'multiply' | 'screen' | 'premultiplied'

export type FlushReason = 'texture' | 'blend' | 'clip' | 'capacity' | 'explicit' | 'end' | 'backdrop'

/** Optional development counters (spec §19.5). All values are cumulative until `reset()`. */
export class RenderStats {
  sprites = 0
  /** SDF boxes / shadow layers written this frame (each is one quad). */
  boxes = 0
  shadows = 0
  /** Backdrop blur: framebuffer copies (≤ 1 per frame) and blur passes this frame. */
  backdropCopies = 0
  backdropPasses = 0
  /** Segment boundaries (a segment == one draw call). */
  flushes = 0
  drawCalls = 0
  /** Number of `renderer.render()` submissions (scissor groups + capacity flushes). */
  renderPasses = 0
  glyphs = 0
  clipChanges = 0
  textureSwitches = 0
  /** Texture slots bound over all draw calls of the frame (a draw call with 3 textures adds 3). */
  texturesBound = 0
  flushReasons: Record<FlushReason, number> = {
    texture: 0,
    blend: 0,
    clip: 0,
    capacity: 0,
    explicit: 0,
    end: 0,
    backdrop: 0,
  }

  reset(): void {
    this.sprites = 0
    this.boxes = 0
    this.shadows = 0
    this.backdropCopies = 0
    this.backdropPasses = 0
    this.flushes = 0
    this.drawCalls = 0
    this.renderPasses = 0
    this.glyphs = 0
    this.clipChanges = 0
    this.textureSwitches = 0
    this.texturesBound = 0
    this.flushReasons.texture = 0
    this.flushReasons.blend = 0
    this.flushReasons.clip = 0
    this.flushReasons.capacity = 0
    this.flushReasons.explicit = 0
    this.flushReasons.end = 0
    this.flushReasons.backdrop = 0
  }
}
