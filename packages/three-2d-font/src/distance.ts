/**
 * Signed distance from antialiased glyph coverage (no outline needed, so every rasterizer works).
 *
 * Pixels with partial coverage seed the transform with their sub-pixel edge offset (`|0.5 − coverage|`), the rest of the
 * field is the exact Euclidean distance transform (Felzenszwalb & Huttenlocher), as in Mapbox's TinySDF.
 */

const INF = 1e20

/** 1-D squared-distance transform along `f` (length n) into `d`. `v`/`z` are scratch. */
function edt1d(f: Float64Array, d: Float64Array, v: Int32Array, z: Float64Array, n: number): void {
  v[0] = 0
  z[0] = -INF
  z[1] = INF
  let k = 0
  for (let q = 1; q < n; q++) {
    let s = (f[q]! + q * q - (f[v[k]!]! + v[k]! * v[k]!)) / (2 * q - 2 * v[k]!)
    while (s <= z[k]!) {
      k--
      s = (f[q]! + q * q - (f[v[k]!]! + v[k]! * v[k]!)) / (2 * q - 2 * v[k]!)
    }
    k++
    v[k] = q
    z[k] = s
    z[k + 1] = INF
  }
  k = 0
  for (let q = 0; q < n; q++) {
    while (z[k + 1]! < q) k++
    const dx = q - v[k]!
    d[q] = dx * dx + f[v[k]!]!
  }
}

function edt2d(grid: Float64Array, w: number, h: number): void {
  const size = Math.max(w, h)
  const f = new Float64Array(size)
  const d = new Float64Array(size)
  const v = new Int32Array(size)
  const z = new Float64Array(size + 1)
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) f[y] = grid[y * w + x]!
    edt1d(f, d, v, z, h)
    for (let y = 0; y < h; y++) grid[y * w + x] = d[y]!
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) f[x] = grid[y * w + x]!
    edt1d(f, d, v, z, w)
    for (let x = 0; x < w; x++) grid[y * w + x] = Math.sqrt(d[x]!)
  }
}

/**
 * Encode the signed distance (negative inside) of a coverage bitmap into 0..255 channel values:
 * `128` at the edge, `0` at `+range` pixels outside, `255` at `−range` inside.
 * (A decoded value `v` is `0.5 − distance / (2·range)` clamped to 0..1.)
 */
export function encodeDistanceChannel(alpha: Uint8Array, width: number, height: number, range: number): Uint8Array {
  const n = width * height
  const outer = new Float64Array(n)
  const inner = new Float64Array(n)
  for (let i = 0; i < n; i++) {
    const a = alpha[i]! / 255
    if (a >= 1) {
      outer[i] = 0
      inner[i] = INF
    } else if (a <= 0) {
      outer[i] = INF
      inner[i] = 0
    } else {
      const off = a > 0.5 ? a - 0.5 : 0.5 - a
      outer[i] = a > 0.5 ? 0 : off * off
      inner[i] = a > 0.5 ? off * off : 0
    }
  }
  edt2d(outer, width, height)
  edt2d(inner, width, height)
  const out = new Uint8Array(n)
  for (let i = 0; i < n; i++) {
    const dist = outer[i]! - inner[i]! // + outside, − inside
    out[i] = Math.round(Math.min(1, Math.max(0, 0.5 - dist / (2 * range))) * 255)
  }
  return out
}
