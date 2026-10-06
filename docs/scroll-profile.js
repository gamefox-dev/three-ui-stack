// Per-direction scroll profile for a running three-ui app. Paste into the browser / Safari Web Inspector console (the app must expose its
// ThreeUI as `window.__ui`), drag a scroll list down and up for ~10 s, then run `__scrollProfile.report()`.
// For every animation frame it records the frame gap, ui.update / ui.render time, the time spent in hit testing and in pointer-move
// handling since the previous frame, and which way the biggest ScrollView moved. `report()` prints one row per direction.
;(() => {
  const ui = window.__ui
  if (!ui) throw new Error('window.__ui is not set')
  const lists = []
  const walk = (n) => { if (n.kind === 'ScrollView') lists.push(n); for (const c of n.children || []) walk(c) }
  const list = () => { lists.length = 0; walk(ui.viewRoot); return lists.sort((a, b) => b.maxScrollY - a.maxScrollY)[0] }
  const rows = []
  let acc = { hit: 0, move: 0, update: 0, render: 0, moves: 0 }
  const time = (obj, key, bucket, count) => {
    const f = obj[key].bind(obj)
    obj[key] = (...a) => { const t = performance.now(); try { return f(...a) } finally { acc[bucket] += performance.now() - t; if (count) acc.moves++ } }
  }
  time(ui.input, 'hitTest', 'hit')
  time(ui.input, 'pointerMove', 'move', true)
  time(ui, 'update', 'update')
  time(ui, 'render', 'render')
  let last = performance.now(), lastY = list()?.scrollY ?? 0
  const frame = (now) => {
    const l = list(), y = l?.scrollY ?? 0
    if (y !== lastY) rows.push({ dir: y > lastY ? 'toward end (finger up)' : 'toward top (finger down)', gap: now - last, ...acc, nodesPainted: ui.stats.nodesPainted, sprites: ui.stats.sprites, draws: ui.stats.drawCalls })
    acc = { hit: 0, move: 0, update: 0, render: 0, moves: 0 }
    last = now; lastY = y
    window.__scrollProfile.raf = requestAnimationFrame(frame)
  }
  const q = (a, p) => { const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(s.length * p))] ?? 0 }
  const avg = (a) => a.reduce((x, y) => x + y, 0) / Math.max(1, a.length)
  window.__scrollProfile = {
    raf: requestAnimationFrame(frame),
    rows,
    report() {
      const out = {}
      for (const dir of new Set(rows.map((r) => r.dir))) {
        const r = rows.filter((x) => x.dir === dir), f = (k) => +avg(r.map((x) => x[k])).toFixed(3)
        out[dir] = { frames: r.length, 'gap avg ms': f('gap'), 'gap p95': +q(r.map((x) => x.gap), 0.95).toFixed(1), 'gap max': +Math.max(...r.map((x) => x.gap)).toFixed(1), 'update ms': f('update'), 'render ms': f('render'), 'render p95': +q(r.map((x) => x.render), 0.95).toFixed(2), 'hitTest ms/frame': f('hit'), 'pointerMove ms/frame': f('move'), 'moves/frame': f('moves'), sprites: f('sprites'), draws: f('draws') }
      }
      console.table(out)
      return out
    },
    stop() { cancelAnimationFrame(this.raf) },
  }
  console.log('scroll profile running: drag the list down and up, then __scrollProfile.report()')
})()
