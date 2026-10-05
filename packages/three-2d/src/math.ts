/** 2D affine transform `[a b tx; c d ty]` stored flat; hot-path friendly. */
export class Affine2 {
  a = 1
  b = 0
  c = 0
  d = 1
  tx = 0
  ty = 0

  identity(): this {
    this.a = 1
    this.b = 0
    this.c = 0
    this.d = 1
    this.tx = 0
    this.ty = 0
    return this
  }

  set(a: number, b: number, c: number, d: number, tx: number, ty: number): this {
    this.a = a
    this.b = b
    this.c = c
    this.d = d
    this.tx = tx
    this.ty = ty
    return this
  }

  copy(m: Affine2): this {
    return this.set(m.a, m.b, m.c, m.d, m.tx, m.ty)
  }

  clone(): Affine2 {
    return new Affine2().copy(this)
  }

  isIdentity(): boolean {
    return this.a === 1 && this.b === 0 && this.c === 0 && this.d === 1 && this.tx === 0 && this.ty === 0
  }

  /** this = this * m (apply m first, then this). */
  multiply(m: Affine2): this {
    const a = this.a * m.a + this.c * m.b
    const b = this.b * m.a + this.d * m.b
    const c = this.a * m.c + this.c * m.d
    const d = this.b * m.c + this.d * m.d
    const tx = this.a * m.tx + this.c * m.ty + this.tx
    const ty = this.b * m.tx + this.d * m.ty + this.ty
    return this.set(a, b, c, d, tx, ty)
  }

  translate(x: number, y: number): this {
    this.tx += this.a * x + this.c * y
    this.ty += this.b * x + this.d * y
    return this
  }

  scale(sx: number, sy: number): this {
    this.a *= sx
    this.b *= sx
    this.c *= sy
    this.d *= sy
    return this
  }

  /** Rotate by radians (positive = clockwise when +y is down). */
  rotate(rad: number): this {
    const cos = Math.cos(rad)
    const sin = Math.sin(rad)
    const a = this.a * cos + this.c * sin
    const b = this.b * cos + this.d * sin
    const c = this.c * cos - this.a * sin
    const d = this.d * cos - this.b * sin
    this.a = a
    this.b = b
    this.c = c
    this.d = d
    return this
  }

  invert(): this {
    const det = this.a * this.d - this.b * this.c
    if (det === 0) return this.identity()
    const id = 1 / det
    const a = this.d * id
    const b = -this.b * id
    const c = -this.c * id
    const d = this.a * id
    const tx = -(a * this.tx + c * this.ty)
    const ty = -(b * this.tx + d * this.ty)
    return this.set(a, b, c, d, tx, ty)
  }

  applyX(x: number, y: number): number {
    return this.a * x + this.c * y + this.tx
  }

  applyY(x: number, y: number): number {
    return this.b * x + this.d * y + this.ty
  }

  hasRotationOrSkew(): boolean {
    return this.b !== 0 || this.c !== 0
  }
}
