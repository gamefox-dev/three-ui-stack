import { PolygonSpriteBatch, createOrthographicCamera, updateOrthographicCamera, Color4, parseColor, type BackdropQuality, type BatchRenderer, type ColorLike, type Disposable } from '@implicit-invocation/three-2d'
import { Color, SRGBColorSpace, Scene, type OrthographicCamera } from 'three'
import { AnimationEngine } from '../anim/engine'
import { createEnvironment, type UIEnvironment } from '../env'
import { InputManager } from '../input/InputManager'
import { BatchDrawContext, type PaintCounters } from '../paint/BatchDrawContext'
import { paintTree, type PaintTreeStats } from '../paint/paintTree'
import { getDefaultClassNameResolver, type ClassNameResolver } from '../resolver'
import type { Keyframes, Style } from '../style/types'
import { FontRegistry } from '../text/FontRegistry'
import { TextLayoutCache } from '../text/TextLayoutCache'
import { YGEnums as E, getYogaConfig } from '../yoga/runtime'
import { DEP_COLOR_SCHEME, DEP_MOTION, DEP_THEME, DEP_VIEWPORT, STYLE_DIRTY, SUBTREE_STYLE_DIRTY } from './flags'
import type { NodeKind, UINode } from './UINode'
import { View } from './View'

/** Renderer surface needed by `ThreeUI` (a Three `WebGPURenderer` satisfies it). Caller-owned. */
export interface ThreeUIRenderer extends BatchRenderer {
  setClearColor(color: unknown, alpha?: number): void
}

export interface ThreeUIOptions {
  /** Caller-owned Three renderer. Without one the UI still styles/lays out/paints into a headless batch. */
  renderer?: ThreeUIRenderer
  /** Logical (CSS-pixel) size of the render surface. */
  width: number
  height: number
  pixelRatio?: number
  colorScheme?: UIEnvironment['colorScheme']
  theme?: string
  platform?: UIEnvironment['platform']
  fonts?: FontRegistry
  classNameResolver?: ClassNameResolver
  /** Clear the framebuffer to this color at the start of every `render()`. */
  clearColor?: ColorLike
  /** Quad capacity of each batch buffer (default 8192; the batch flushes when full). */
  maxSprites?: number
  /** Called when something invalidated the UI (use it to schedule a frame on demand). */
  onInvalidate?: () => void
  /**
   * `backdrop-filter: blur()` quality: `'full'` (default; small + large blur), `'low'` (one small blur) or `'off'`
   * (elements fall back to their own translucent background). Costs nothing in frames where no node uses a backdrop
   * filter. Needs a renderer with `copyFramebufferToTexture` (Three's `WebGPURenderer`); fixed at construction.
   */
  backdropBlur?: BackdropQuality
  /**
   * Textures one draw call can sample (`'auto'`, the default with a renderer: the renderer's texture-unit budget, up to 8; `1`: one
   * texture per draw call). Atlas pages, avatars and fonts then share draw calls instead of splitting them. Fixed at construction.
   */
  maxTextures?: number | 'auto'
  /** Gradient shader cost cap, 2…8 (default 8). Gradients with ≤ 3 stops already take a cheaper loop; 3 caps the rest at 3 stops. */
  maxGradientStops?: number
  /**
   * `overflow: hidden` / scroll clipping: `'scissor'` (default; hardware scissor, one `renderer.render()` per distinct clip rect) or
   * `'shader'` (clipped in the fragment shader — anti-aliased, follows the box's rounded corners — so clips add no render passes and
   * never split a draw call). Fixed at construction.
   */
  clip?: 'scissor' | 'shader'
  /**
   * When nothing changed since the last frame, `render()` draws the previous frame's batch again instead of repainting the tree
   * (default true; needs a renderer). `ui.stats.replayed` tells which happened.
   */
  replayStaticFrames?: boolean
}

/** Debug counters (spec §19.5). Style/layout counters are cumulative; paint counters describe the last frame. */
export interface UIStats {
  nodes: number
  layoutPasses: number
  styleRecomputes: number
  paintOps: number
  /** Last frame: sprite batch segment boundaries / draw calls / quads / glyphs / clip changes. */
  flushes: number
  drawCalls: number
  renderPasses: number
  /** Last frame: texture slots bound over all draw calls, and texture changes that split a draw call. */
  texturesBound: number
  textureSwitches: number
  sprites: number
  glyphs: number
  clipChanges: number
  /** Last frame: SDF boxes and shadow layers painted, backdrop framebuffer copies (≤ 1) and blur passes. */
  boxes: number
  shadows: number
  backdropCopies: number
  backdropPasses: number
  nodesPainted: number
  nodesCulled: number
  /** Last `render()`: true when it replayed the previous frame's batch instead of repainting the tree. */
  replayed: boolean
}

export type ThemeStyles = Partial<Record<NodeKind | 'root', Style>>

interface Tickable {
  _tick(dt: number): void
}

/** The UI instance: owns the node tree, style resolution, layout, input and painting. No React, no DOM. */
export class ThreeUI implements Disposable {
  readonly environment: UIEnvironment
  readonly fonts: FontRegistry
  readonly textLayouts = new TextLayoutCache()
  readonly input: InputManager
  /** CSS-like animations, transitions and `node.animate()` handles, advanced by `update(dt)`. */
  readonly engine: AnimationEngine
  private readonly keyframesByName = new Map<string, Keyframes>()
  readonly stats: UIStats = {
    nodes: 0,
    layoutPasses: 0,
    styleRecomputes: 0,
    paintOps: 0,
    flushes: 0,
    drawCalls: 0,
    renderPasses: 0,
    texturesBound: 0,
    textureSwitches: 0,
    sprites: 0,
    glyphs: 0,
    clipChanges: 0,
    boxes: 0,
    shadows: 0,
    backdropCopies: 0,
    backdropPasses: 0,
    nodesPainted: 0,
    nodesCulled: 0,
    replayed: false,
  }
  /** Internal parent of the user root; sized to the viewport so `flex: 1` roots fill the screen. */
  readonly viewRoot: View
  readonly camera: OrthographicCamera
  readonly batch: PolygonSpriteBatch
  clearColor: Color4 | null
  onInvalidate: (() => void) | undefined

  private _classNameResolver: ClassNameResolver | null
  private theme: ThemeStyles | ((env: UIEnvironment) => ThemeStyles) | null = null
  private renderer: ThreeUIRenderer | null
  private userRoot: UINode | null = null
  private readonly tickables = new Set<Tickable>()
  private readonly ctx: BatchDrawContext
  private readonly counters: PaintCounters = { paintOps: 0 }
  private readonly paintStats: PaintTreeStats = { nodesPainted: 0, nodesCulled: 0 }
  private readonly clearScene = new Scene()
  private readonly clearThree = new Color()
  private appliedPixelRatio = -1
  private _updatePending = true
  private disposed = false
  private replayStatic = true
  /** @internal */ _paintDirty = true

  constructor(options: ThreeUIOptions) {
    this.environment = createEnvironment({
      viewport: { width: options.width, height: options.height, pixelRatio: options.pixelRatio ?? 1 },
      ...(options.colorScheme ? { colorScheme: options.colorScheme } : {}),
      ...(options.theme ? { theme: options.theme } : {}),
      ...(options.platform ? { platform: options.platform } : {}),
    })
    this.fonts = options.fonts ?? new FontRegistry()
    this._classNameResolver = options.classNameResolver ?? null
    this.renderer = options.renderer ?? null
    this.onInvalidate = options.onInvalidate
    this.clearColor = options.clearColor !== undefined ? parseColor(options.clearColor, new Color4()) : null
    this.camera = createOrthographicCamera(options.width, options.height)
    this.batch = new PolygonSpriteBatch({
      ...(options.renderer ? { renderer: options.renderer, backdrop: options.backdropBlur ?? 'full' } : {}),
      maxSprites: options.maxSprites ?? (options.renderer ? 8192 : 16383),
      ...(options.maxTextures !== undefined ? { maxTextures: options.maxTextures } : {}),
      ...(options.maxGradientStops !== undefined ? { maxGradientStops: options.maxGradientStops } : {}),
      ...(options.clip ? { clip: options.clip } : {}),
    })
    this.replayStatic = options.replayStaticFrames !== false
    this.ctx = new BatchDrawContext(this.batch, this.counters)
    this.engine = new AnimationEngine(this)
    this.viewRoot = new View({ name: 'viewRoot', style: { width: options.width, height: options.height } })
    this.viewRoot._attach(this)
    this.input = new InputManager(this)
  }

  // ───────────────────────────── configuration ─────────────────────────────

  get classNameResolver(): ClassNameResolver | null {
    return this._classNameResolver ?? getDefaultClassNameResolver()
  }

  set classNameResolver(resolver: ClassNameResolver | null) {
    this._classNameResolver = resolver
    this.invalidateAllStyles()
  }

  /** Theme/default stylesheet layer (below `className`, above inherited values). */
  setTheme(theme: ThemeStyles | ((env: UIEnvironment) => ThemeStyles) | null): void {
    this.theme = theme
    this.invalidateAllStyles()
  }

  /** Register named keyframes for style `animation: { name }` (Tailwind `@keyframes` are looked up in the resolver). */
  registerKeyframes(name: string, keyframes: Keyframes): this {
    this.keyframesByName.set(name, keyframes)
    return this
  }

  /** @internal */
  lookupKeyframes(name: string): Keyframes | undefined {
    return this.keyframesByName.get(name) ?? this.classNameResolver?.keyframes?.(name)
  }

  /** @internal */
  _themeStyle(node: UINode): Style | undefined {
    const t = typeof this.theme === 'function' ? this.theme(this.environment) : this.theme
    if (!t) return undefined
    const own = t[node.kind]
    if (node === this.userRoot && t.root) return own ? { ...own, ...t.root } : t.root
    return own
  }

  setRoot(root: UINode | null): void {
    if (this.userRoot === root) return
    if (this.userRoot) this.viewRoot.remove(this.userRoot)
    this.userRoot = root
    if (root) this.viewRoot.append(root)
    this._paintDirty = true
    this._requestUpdate()
  }

  get root(): UINode | null {
    return this.userRoot
  }

  /** Change viewport size and/or pixel ratio (logical size is independent of the framebuffer DPR). */
  resize(width: number, height: number, pixelRatio?: number): void {
    const v = this.environment.viewport
    const dpr = pixelRatio ?? v.pixelRatio
    if (v.width === width && v.height === height && v.pixelRatio === dpr) return
    const widthChanged = v.width !== width
    v.width = width
    v.height = height
    v.pixelRatio = dpr
    this.viewRoot.setStyle({ width, height })
    updateOrthographicCamera(this.camera, width, height, true, true)
    if (widthChanged) this.invalidateDeps(DEP_VIEWPORT)
    this.invalidateAllLayout()
    this._paintDirty = true
    this._requestUpdate()
  }

  setColorScheme(scheme: UIEnvironment['colorScheme']): void {
    if (this.environment.colorScheme === scheme) return
    this.environment.colorScheme = scheme
    this.invalidateDeps(DEP_COLOR_SCHEME)
  }

  /**
   * Environment switches that class variants and animations react to: `reducedMotion` drives `motion-reduce:` /
   * `motion-safe:` (and makes the engine skip decorative animation when you ask it to), `colorScheme` drives `dark:`.
   */
  setMediaFlags(flags: { reducedMotion?: boolean; colorScheme?: UIEnvironment['colorScheme'] }): void {
    if (flags.colorScheme !== undefined) this.setColorScheme(flags.colorScheme)
    if (flags.reducedMotion !== undefined && this.environment.reducedMotion !== flags.reducedMotion) {
      this.environment.reducedMotion = flags.reducedMotion
      this.invalidateDeps(DEP_MOTION)
    }
  }

  setThemeName(name: string): void {
    if (this.environment.theme === name) return
    this.environment.theme = name
    this.invalidateDeps(DEP_THEME)
  }

  /** Attach / replace the caller-owned renderer. */
  setRenderer(renderer: ThreeUIRenderer | null): void {
    this.renderer = renderer
    this.batch.setRenderer(renderer)
  }

  private invalidateDeps(mask: number): void {
    this.viewRoot.traverse((n) => {
      if (n.classDeps & mask) n.markDirty(STYLE_DIRTY)
    })
    this._requestUpdate()
  }

  private invalidateAllStyles(): void {
    this.viewRoot.traverse((n) => {
      n.dirty |= STYLE_DIRTY | SUBTREE_STYLE_DIRTY
    })
    this._paintDirty = true
    this._requestUpdate()
  }

  private invalidateAllLayout(): void {
    // pixel ratio changes the Yoga rounding grid; re-set the root size so Yoga re-runs layout
    this.appliedPixelRatio = -1
  }

  // ───────────────────────────── scheduling ─────────────────────────────

  /** @internal */
  _requestUpdate(): void {
    this._updatePending = true
    this.onInvalidate?.()
  }

  /** @internal */
  _registerTickable(t: Tickable): void {
    this.tickables.add(t)
    this._requestUpdate()
  }

  /** @internal */
  _unregisterTickable(t: Tickable): void {
    this.tickables.delete(t)
  }

  /** True when `update()`/`render()` would produce a different picture (or animations are running). */
  get needsRender(): boolean {
    return this._paintDirty || this._updatePending || this.tickables.size > 0 || this.engine.hasRunning
  }

  // ───────────────────────────── update: style → layout ─────────────────────────────

  /**
   * Advance animations by `dt` seconds, resolve dirty styles, run Yoga layout when needed.
   * Returns true when a repaint is needed.
   */
  update(dt = 0): boolean {
    if (this.disposed) return false
    if (dt > 0 && this.tickables.size > 0) {
      for (const t of [...this.tickables]) t._tick(dt)
    }
    // with dt = 0 nothing advances (a paused / frozen game freezes every animation); cancel / finish / seek still apply
    this.engine.tick(dt)
    this.updateStyles(this.viewRoot)
    this.runLayout()
    this._updatePending = false
    return this._paintDirty
  }

  private updateStyles(node: UINode): void {
    const d = node.dirty
    if (!(d & (STYLE_DIRTY | SUBTREE_STYLE_DIRTY))) return
    node.dirty &= ~(STYLE_DIRTY | SUBTREE_STYLE_DIRTY)
    if (d & STYLE_DIRTY) {
      const inheritedChanged = node._recomputeStyle(this)
      if (inheritedChanged) for (const c of node.children) c.dirty |= STYLE_DIRTY
    }
    for (const c of node.children) this.updateStyles(c)
  }

  private runLayout(): void {
    const root = this.viewRoot
    const dpr = this.environment.viewport.pixelRatio
    if (this.appliedPixelRatio !== dpr) {
      getYogaConfig().setPointScaleFactor(dpr)
      const v = this.environment.viewport
      root._yoga.setWidth(v.width + 1) // force a fresh pass under the new rounding grid
      root._yoga.setWidth(v.width)
      this.appliedPixelRatio = dpr
    }
    if (!root._yoga.isDirty()) return
    root._yoga.calculateLayout(undefined, undefined, E.Direction.LTR)
    this.stats.layoutPasses++
    let count = 0
    const read = (n: UINode): void => {
      count++
      n._readLayout()
      for (const c of n.children) read(c)
      n._afterLayout()
    }
    read(root)
    this.stats.nodes = count
    this._paintDirty = true
  }

  // ───────────────────────────── render ─────────────────────────────

  /** Resolve pending work, then rebuild the batches and draw the UI (always draws). */
  render(): void {
    if (this.disposed) return
    this.update(0)
    const renderer = this.renderer
    if (renderer && this.clearColor) {
      const c = this.clearColor
      renderer.setClearColor(this.clearThree.setRGB(c.r, c.g, c.b, SRGBColorSpace), c.a)
      const auto = renderer.autoClear
      renderer.autoClear = true
      renderer.render(this.clearScene, this.camera)
      renderer.autoClear = auto
    }
    const batch = this.batch
    if (this.replayStatic && !this._paintDirty && this.tickables.size === 0 && !this.engine.hasRunning && batch.canReplay) {
      // nothing changed: the previous frame's quads are still in the batch buffers
      batch.replay()
      this.stats.replayed = true
      this.copyBatchStats()
      return
    }
    this.stats.replayed = false
    batch.stats.reset()
    this.counters.paintOps = 0
    this.paintStats.nodesPainted = 0
    this.paintStats.nodesCulled = 0
    batch.begin(this.camera)
    this.ctx.reset()
    this.ctx.snap = 1 / this.environment.viewport.pixelRatio
    paintTree(this.viewRoot, this.ctx, this.environment.viewport.width, this.environment.viewport.height, this.paintStats)
    batch.end()
    this._paintDirty = false
    this.copyBatchStats()
  }

  private copyBatchStats(): void {
    const s = this.stats
    const b = this.batch.stats
    s.paintOps = this.counters.paintOps
    s.flushes = b.flushes
    s.drawCalls = b.drawCalls
    s.renderPasses = b.renderPasses
    s.texturesBound = b.texturesBound
    s.textureSwitches = b.textureSwitches
    s.sprites = b.sprites
    s.glyphs = b.glyphs
    s.clipChanges = b.clipChanges
    s.boxes = b.boxes
    s.shadows = b.shadows
    s.backdropCopies = b.backdropCopies
    s.backdropPasses = b.backdropPasses
    s.nodesPainted = this.paintStats.nodesPainted
    s.nodesCulled = this.paintStats.nodesCulled
  }

  /** Deepest node under a root-space point. */
  hitTest(x: number, y: number): UINode | null {
    return this.input.hitTest(x, y)
  }

  /**
   * Nearest interactive node under a root-space point (focusable, has press / drag / wheel handlers, or a scrollable
   * `ScrollView`), or `null`. Unlike `hitTest()` this ignores decorative nodes — use it to decide whether the UI should
   * take a pointer press or let it fall through to the game.
   */
  hitTestInteractive(x: number, y: number): UINode | null {
    return this.input.hitTestInteractive(x, y)
  }

  /** `hitTestInteractive(x, y) !== null`. */
  isInteractiveAt(x: number, y: number): boolean {
    return this.input.hitTestInteractive(x, y) !== null
  }

  dispose(): void {
    if (this.disposed) return
    this.disposed = true
    this.tickables.clear()
    this.viewRoot.dispose()
    this.batch.dispose()
    this.renderer = null
    this.userRoot = null
  }

  get isDisposed(): boolean {
    return this.disposed
  }
}

export function createThreeUI(options: ThreeUIOptions): ThreeUI {
  return new ThreeUI(options)
}
