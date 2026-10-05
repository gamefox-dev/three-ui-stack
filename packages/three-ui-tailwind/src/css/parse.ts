/** Minimal parser for the (regular, machine-generated) CSS that Tailwind v4 emits. Not a general CSS parser. */

export interface Decl {
  type: 'decl'
  prop: string
  value: string
  important: boolean
}

export interface RuleNode {
  type: 'rule'
  selector: string
  nodes: CssNode[]
}

export interface AtRuleNode {
  type: 'at'
  name: string
  params: string
  nodes: CssNode[] | null
}

export type CssNode = Decl | RuleNode | AtRuleNode

export function parseCss(source: string): CssNode[] {
  let i = 0
  const n = source.length

  function skipTrivia(): void {
    for (;;) {
      while (i < n && /\s/.test(source[i]!)) i++
      if (source[i] === '/' && source[i + 1] === '*') {
        const end = source.indexOf('*/', i + 2)
        i = end < 0 ? n : end + 2
      } else break
    }
  }

  /** Read until one of `stops` at depth 0 (outside strings and parentheses). Returns the text and the stop char. */
  function readUntil(stops: string): { text: string; stop: string } {
    const start = i
    let depth = 0
    while (i < n) {
      const c = source[i]!
      if (c === '"' || c === "'") {
        const q = c
        i++
        while (i < n && source[i] !== q) {
          if (source[i] === '\\') i++
          i++
        }
      } else if (c === '/' && source[i + 1] === '*') {
        const end = source.indexOf('*/', i + 2)
        i = end < 0 ? n : end + 1
      } else if (c === '(' || c === '[') depth++
      else if (c === ')' || c === ']') depth--
      else if (c === '\\') i++
      else if (depth <= 0 && stops.includes(c)) {
        return { text: source.slice(start, i), stop: c }
      }
      i++
    }
    return { text: source.slice(start, i), stop: '' }
  }

  function parseBlock(): CssNode[] {
    const nodes: CssNode[] = []
    for (;;) {
      skipTrivia()
      if (i >= n) return nodes
      if (source[i] === '}') {
        i++
        return nodes
      }
      if (source[i] === ';') {
        i++
        continue
      }
      const head = readUntil('{};')
      const text = head.text.trim()
      if (head.stop === '{') {
        i++
        const children = parseBlock()
        if (text.startsWith('@')) {
          const space = text.search(/\s|\(/)
          nodes.push({ type: 'at', name: (space < 0 ? text : text.slice(0, space)).slice(1), params: space < 0 ? '' : text.slice(space).trim(), nodes: children })
        } else {
          nodes.push({ type: 'rule', selector: text, nodes: children })
        }
      } else {
        if (head.stop === ';') i++
        if (!text) continue
        if (text.startsWith('@')) {
          const space = text.search(/\s|\(/)
          nodes.push({ type: 'at', name: (space < 0 ? text : text.slice(0, space)).slice(1), params: space < 0 ? '' : text.slice(space).trim(), nodes: null })
        } else {
          const colon = text.indexOf(':')
          if (colon > 0) {
            let value = text.slice(colon + 1).trim()
            const important = /!\s*important$/i.test(value)
            if (important) value = value.replace(/!\s*important$/i, '').trim()
            nodes.push({ type: 'decl', prop: text.slice(0, colon).trim(), value, important })
          }
        }
      }
    }
  }

  return parseBlock()
}

/** Undo CSS identifier escapes (`hover\:bg-red-500` → `hover:bg-red-500`). */
export function unescapeCssIdent(ident: string): string {
  return ident.replace(/\\([0-9a-fA-F]{1,6})\s?|\\(.)/g, (_m, hex: string | undefined, ch: string | undefined) => (hex ? String.fromCodePoint(parseInt(hex, 16)) : ch!))
}
