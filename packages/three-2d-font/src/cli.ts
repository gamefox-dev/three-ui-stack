import { packFontFile } from './node'

const HELP = `three-2d-font — bake TTF/OTF fonts into three-2d bitmap-font atlases

Usage:
  three-2d-font pack <font.ttf> --output <base> [options]

Options:
  --size <px>          Em size to bake at (default 32)
  --charset <name>     latin | ascii | digits (default latin)
  --chars <text>       Literal characters to bake instead of a preset
  --supersample <n>    Rasterizer supersampling (default 4)
  --padding <px>       Transparent border per glyph (default 2)
  --family <name>      Override family name
  --weight <n>         Override weight (e.g. 700)
  --style <name>       Override style name
  --max-atlas <px>     Maximum atlas edge (default 4096)
  -h, --help           Show this help

Output: <base>.png and <base>.json (format "three-2d-bitmap-font", version 1)
`

interface Parsed {
  command?: string | undefined
  input?: string | undefined
  flags: Map<string, string>
  help: boolean
}

function parseArgs(argv: string[]): Parsed {
  const flags = new Map<string, string>()
  const positional: string[] = []
  let help = false
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!
    if (a === '-h' || a === '--help') help = true
    else if (a.startsWith('--')) {
      const eq = a.indexOf('=')
      if (eq > 0) flags.set(a.slice(2, eq), a.slice(eq + 1))
      else flags.set(a.slice(2), argv[++i] ?? '')
    } else positional.push(a)
  }
  return { command: positional[0], input: positional[1], flags, help }
}

export async function main(argv: string[]): Promise<number> {
  const args = parseArgs(argv)
  const log = (m: string) => (globalThis as { console?: { log(m: string): void } }).console?.log(m)
  const err = (m: string) => (globalThis as { console?: { error(m: string): void } }).console?.error(m)
  if (args.help || !args.command) {
    log(HELP)
    return args.help ? 0 : 1
  }
  if (args.command !== 'pack' || !args.input) {
    err(`Unknown or incomplete command.\n\n${HELP}`)
    return 1
  }
  const output = args.flags.get('output') ?? args.flags.get('o')
  if (!output) {
    err('Missing --output <base>')
    return 1
  }
  const num = (k: string, d: number) => (args.flags.has(k) ? Number(args.flags.get(k)) : d)
  const size = num('size', 32)
  const result = await packFontFile(args.input, output, {
    size,
    characters: args.flags.get('chars') ?? args.flags.get('charset') ?? 'latin',
    supersample: num('supersample', 4),
    padding: num('padding', 2),
    maxAtlasSize: num('max-atlas', 4096),
    ...(args.flags.has('family') ? { family: args.flags.get('family')! } : {}),
    ...(args.flags.has('style') ? { style: args.flags.get('style')! } : {}),
    ...(args.flags.has('weight') ? { weight: Number(args.flags.get('weight')) } : {}),
  })
  log(`wrote ${result.png} (${result.baked.atlas.width}×${result.baked.atlas.height}) and ${result.json} — ${result.baked.json.glyphs.length} glyphs`)
  return 0
}
