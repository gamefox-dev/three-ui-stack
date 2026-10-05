import { CanvasTexture, SRGBColorSpace } from 'three'
import { NinePatch, TextureAtlas, TextureRegion, configureTexture, Animation } from '@implicit-invocation/three-2d'

/** Examples draw their art at startup with Canvas2D so the repo ships no binary art assets. */
function canvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return [c, c.getContext('2d')!]
}

function toTexture(c: HTMLCanvasElement, mipmaps = false): CanvasTexture {
  const t = new CanvasTexture(c)
  t.colorSpace = SRGBColorSpace
  return configureTexture(t, { mipmaps })
}

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  g.beginPath()
  g.moveTo(x + r, y)
  g.arcTo(x + w, y, x + w, y + h, r)
  g.arcTo(x + w, y + h, x, y + h, r)
  g.arcTo(x, y + h, x, y, r)
  g.arcTo(x, y, x + w, y, r)
  g.closePath()
}

/**
 * A gem/coin sprite sheet packed as a libGDX `.atlas` text file — exercises `TextureAtlas.fromText`.
 * 8 gems (32×32) in a row plus a 16-frame coin spin strip (32×32).
 */
export function makeGemAtlas(): { atlas: TextureAtlas; gems: TextureRegion[]; coin: Animation<TextureRegion> } {
  const [c, g] = canvas(512, 64)
  const hues = [0, 28, 52, 120, 170, 210, 265, 320]
  const lines = ['gems.png', 'size: 512,64', 'format: RGBA8888', 'filter: Linear,Linear', 'repeat: none']
  hues.forEach((h, i) => {
    const x = i * 32
    g.save()
    g.translate(x + 16, 16)
    const grad = g.createLinearGradient(-12, -12, 12, 12)
    grad.addColorStop(0, `hsl(${h} 90% 72%)`)
    grad.addColorStop(1, `hsl(${h} 80% 40%)`)
    g.fillStyle = grad
    g.beginPath()
    g.moveTo(0, -13)
    g.lineTo(12, -4)
    g.lineTo(8, 12)
    g.lineTo(-8, 12)
    g.lineTo(-12, -4)
    g.closePath()
    g.fill()
    g.strokeStyle = `hsl(${h} 60% 25%)`
    g.lineWidth = 2
    g.stroke()
    g.fillStyle = 'rgba(255,255,255,.55)'
    g.beginPath()
    g.moveTo(-3, -9)
    g.lineTo(4, -4)
    g.lineTo(-2, -2)
    g.closePath()
    g.fill()
    g.restore()
    lines.push(`gem`, '  rotate: false', `  xy: ${x}, 0`, '  size: 32, 32', '  orig: 32, 32', '  offset: 0, 0', `  index: ${i}`)
  })
  for (let i = 0; i < 16; i++) {
    const x = i * 32
    const squash = Math.abs(Math.cos((i / 16) * Math.PI))
    g.save()
    g.translate(x + 16, 48)
    g.fillStyle = '#fbbf24'
    g.strokeStyle = '#92400e'
    g.lineWidth = 2
    g.beginPath()
    g.ellipse(0, 0, Math.max(2, 12 * squash), 12, 0, 0, Math.PI * 2)
    g.fill()
    g.stroke()
    g.fillStyle = 'rgba(255,255,255,.5)'
    g.fillRect(-1, -8, 2, 6)
    g.restore()
    lines.push('coin', '  rotate: false', `  xy: ${x}, 32`, '  size: 32, 32', '  orig: 32, 32', '  offset: 0, 0', `  index: ${i}`)
  }
  const texture = toTexture(c)
  const atlas = TextureAtlas.fromText(lines.join('\n'), () => texture)
  return { atlas, gems: atlas.findRegions('gem'), coin: new Animation(1 / 18, atlas.findRegions('coin'), 'loop') }
}

/** Six-frame robot walk cycle (48×48 frames) used for frame `Animation` demos. */
export function makeWalkCycle(): { frames: TextureRegion[]; texture: CanvasTexture } {
  const [c, g] = canvas(48 * 6, 48)
  for (let i = 0; i < 6; i++) {
    const t = (i / 6) * Math.PI * 2
    g.save()
    g.translate(i * 48 + 24, 26 + Math.abs(Math.sin(t)) * -3)
    g.fillStyle = '#6d5dfc'
    roundRect(g, -10, -14, 20, 22, 6)
    g.fill()
    g.fillStyle = '#e0e7ff'
    roundRect(g, -7, -11, 14, 8, 3)
    g.fill()
    g.fillStyle = '#18181b'
    g.fillRect(-4, -9, 3, 3)
    g.fillRect(2, -9, 3, 3)
    g.strokeStyle = '#a5b4fc'
    g.lineWidth = 4
    g.lineCap = 'round'
    const swing = Math.sin(t) * 7
    g.beginPath()
    g.moveTo(-4, 8)
    g.lineTo(-4 + swing, 18)
    g.moveTo(4, 8)
    g.lineTo(4 - swing, 18)
    g.stroke()
    g.restore()
  }
  const texture = toTexture(c)
  return { texture, frames: new TextureRegion(texture).split(48, 48)[0]! }
}

/** Rounded panel with a border, designed to be scaled as a nine-patch (24px corners). */
export function makeNinePatch(accent = '#6d5dfc'): NinePatch {
  const [c, g] = canvas(96, 96)
  const grad = g.createLinearGradient(0, 0, 0, 96)
  grad.addColorStop(0, '#27272a')
  grad.addColorStop(1, '#18181b')
  g.fillStyle = grad
  roundRect(g, 3, 3, 90, 90, 20)
  g.fill()
  g.strokeStyle = accent
  g.lineWidth = 4
  roundRect(g, 3, 3, 90, 90, 20)
  g.stroke()
  g.strokeStyle = 'rgba(255,255,255,.12)'
  g.lineWidth = 2
  roundRect(g, 9, 9, 78, 78, 15)
  g.stroke()
  return new NinePatch(new TextureRegion(toTexture(c)), 24, 24, 24, 24)
}

/** Colorful avatar-like image: radial gradient + initials-free pattern. */
export function makeAvatar(seed: number, size = 96): TextureRegion {
  const [c, g] = canvas(size, size)
  const hue = (seed * 47) % 360
  const grad = g.createLinearGradient(0, 0, size, size)
  grad.addColorStop(0, `hsl(${hue} 85% 62%)`)
  grad.addColorStop(1, `hsl(${(hue + 60) % 360} 80% 38%)`)
  g.fillStyle = grad
  g.fillRect(0, 0, size, size)
  g.fillStyle = 'rgba(255,255,255,.22)'
  for (let i = 0; i < 5; i++) {
    const r = ((seed * 31 + i * 17) % 28) + 10
    g.beginPath()
    g.arc(((seed * 13 + i * 29) % size), ((seed * 7 + i * 41) % size), r, 0, Math.PI * 2)
    g.fill()
  }
  g.fillStyle = 'rgba(255,255,255,.9)'
  g.beginPath()
  g.arc(size / 2, size * 0.4, size * 0.15, 0, Math.PI * 2)
  g.fill()
  g.beginPath()
  g.ellipse(size / 2, size * 0.82, size * 0.28, size * 0.22, 0, Math.PI, 0)
  g.fill()
  return new TextureRegion(toTexture(c, true))
}

/** Wide landscape picture (for resize-mode demos: 240×120 with a clear center marker). */
export function makeLandscape(): TextureRegion {
  const [c, g] = canvas(240, 120)
  const sky = g.createLinearGradient(0, 0, 0, 120)
  sky.addColorStop(0, '#312e81')
  sky.addColorStop(0.6, '#c026d3')
  sky.addColorStop(1, '#fb923c')
  g.fillStyle = sky
  g.fillRect(0, 0, 240, 120)
  g.fillStyle = '#fde68a'
  g.beginPath()
  g.arc(120, 78, 26, 0, Math.PI * 2)
  g.fill()
  g.fillStyle = '#1e1b4b'
  g.beginPath()
  g.moveTo(0, 120)
  g.lineTo(0, 92)
  g.lineTo(50, 60)
  g.lineTo(92, 96)
  g.lineTo(140, 66)
  g.lineTo(190, 100)
  g.lineTo(240, 74)
  g.lineTo(240, 120)
  g.closePath()
  g.fill()
  g.strokeStyle = 'rgba(255,255,255,.8)'
  g.lineWidth = 2
  g.strokeRect(1, 1, 238, 118)
  g.beginPath()
  g.moveTo(120, 0)
  g.lineTo(120, 120)
  g.moveTo(0, 60)
  g.lineTo(240, 60)
  g.stroke()
  return new TextureRegion(toTexture(c, true))
}
