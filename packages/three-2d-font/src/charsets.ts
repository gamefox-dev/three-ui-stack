const range = (from: number, to: number): number[] => Array.from({ length: to - from + 1 }, (_, i) => from + i)

export const CHARSETS = {
  /** Printable ASCII. */
  ascii: range(0x20, 0x7e),
  digits: range(0x30, 0x39),
  /** ASCII + Latin-1 supplement + common typographic punctuation and arrows. */
  latin: [
    ...range(0x20, 0x7e),
    ...range(0xa0, 0xff),
    0x2013, 0x2014, 0x2018, 0x2019, 0x201c, 0x201d, 0x2022, 0x2026, 0x20ac, 0x2122, 0x2190, 0x2191, 0x2192, 0x2193, 0x2212, 0x2713, 0x2715, 0xfffd,
  ],
} as const satisfies Record<string, readonly number[]>

export type CharsetName = keyof typeof CHARSETS

/** Resolve a preset name, a literal string of characters, or an iterable of code points to a sorted unique list. */
export function resolveCharacters(spec: CharsetName | string | Iterable<number> | undefined): number[] {
  if (spec === undefined) return [...CHARSETS.latin]
  const out = new Set<number>()
  if (typeof spec === 'string') {
    if (spec in CHARSETS) for (const cp of CHARSETS[spec as CharsetName]) out.add(cp)
    else for (const ch of spec) out.add(ch.codePointAt(0)!)
  } else {
    for (const cp of spec) out.add(cp)
  }
  return [...out].sort((a, b) => a - b)
}
