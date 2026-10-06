import { mix, pow, step, vec3 } from 'three/tsl'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type N = any

/**
 * sRGB → linear as plain arithmetic. `sRGBTransferEOTF` is an `Fn`, and Fn calls inside a conditional branch make
 * Three's GLSL node builder throw while it infers the branch type, so shader branches use these inline forms.
 */
export function srgbToLinearInline(c: N): N {
  return mix(c.div(12.92), pow(c.add(0.055).div(1.055), vec3(2.4, 2.4, 2.4)), step(0.04045, c))
}

export function linearToSrgbInline(c: N): N {
  const lo = c.mul(12.92)
  const hi = pow(c.max(0.0031308), vec3(1 / 2.4, 1 / 2.4, 1 / 2.4)).mul(1.055).sub(0.055)
  return mix(lo, hi, step(0.0031308, c))
}
