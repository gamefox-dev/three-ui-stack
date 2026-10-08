// Frame profile for a running three-ui app: paste into the browser / Safari Web Inspector console, use the app (scroll a list, open screens)
// for ~15 s, then run `__frameProfile.report()`. The app must expose its ThreeUI as `window.__ui`; if it also exposes a game host with a stage
// (`window.__host.stage`, himo-vibe does) the profile also times the stage's own frame, the UI update / draw / present steps and the time
// Optionally measures time until submitted GPU work has completed (WebGPU only). This is queue-completion latency, NOT isolated GPU
// execution time. Per-frame queue probes are OFF by default: they can perturb timing. Enable explicitly before pasting with
// `window.__frameProfileOptions = { probeQueue: true }`, and compare against a run with probes disabled.
//
// One row per 2 s window:
//   cb / made   animation-frame callbacks vs frames the app really produced (made < cb at 60 Hz means the app's pacing is skipping callbacks)
//   gap ms      time between callbacks: p50 / p95 / max; `short` counts gaps < 9 ms (a callback that came early, e.g. a catch-up burst)
//   over20/33   callbacks later than 20 / 33 ms
//   frame ms    time inside the app's frame() on the main thread, p50 / p95
//   upd / draw / present   ui.update, ui.render (UI draw into its texture) and the final composite, mean ms per produced frame
//   queue ms    frame start → queue completion callback (queue.onSubmittedWorkDone), p50 / p95; includes submission, queued work,
//               and main-thread callback delivery. A large value alone does NOT establish that the app is GPU-bound.
//
// `__frameProfile.report()` prints the table and returns the rows as JSON text (also copied to the clipboard when allowed);
// `__frameProfile.stop()` removes the hooks.
;(() => {
  if (window.__frameProfile) window.__frameProfile.stop()
  const ui = window.__ui
  if (!ui) throw new Error('window.__ui is not set')
  const stage = window.__host?.stage
  const device = stage?.renderer?.backend?.device
  const probeQueue = window.__frameProfileOptions?.probeQueue === true && !!device
  const WINDOW = 2000
  const rows = []
  const undo = []
  let w = fresh()
  function fresh() {
    return { start: performance.now(), cb: 0, made: 0, gaps: [], frame: [], upd: 0, draw: 0, present: 0, draws: 0, gpu: [] }
  }
  const q = (a, p) => { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(s.length * p))] }
  const f1 = (n) => Math.round(n * 10) / 10
  const wrap = (obj, key, fn) => {
    const orig = obj[key]
    if (typeof orig !== 'function') return
    obj[key] = fn(orig.bind(obj))
    undo.push(() => { obj[key] = orig })
  }

  if (stage) {
    wrap(stage, 'frame', (orig) => (dt) => {
      const t0 = performance.now()
      const cur = w
      orig(dt)
      cur.made++
      cur.frame.push(performance.now() - t0)
      if (probeQueue) device.queue.onSubmittedWorkDone().then(() => cur.gpu.push(performance.now() - t0), () => {})
    })
    const hook = stage.uiHook
    if (hook) {
      wrap(hook, 'update', (orig) => (dt) => { const t = performance.now(); orig(dt); w.upd += performance.now() - t })
      wrap(hook, 'draw', (orig) => () => { const t = performance.now(); orig(); w.draw += performance.now() - t; w.draws++ })
    }
    if (stage.pipeline) wrap(stage.pipeline, 'renderUi', (orig) => () => { const t = performance.now(); orig(); w.present += performance.now() - t })
  } else {
    wrap(ui, 'render', (orig) => () => { const t = performance.now(); orig(); const d = performance.now() - t; w.draw += d; w.draws++; w.frame.push(d); w.made++ })
    wrap(ui, 'update', (orig) => (dt) => { const t = performance.now(); orig(dt); w.upd += performance.now() - t })
  }

  let last = performance.now()
  let raf = 0
  const flush = (now) => {
    const secs = (now - w.start) / 1000
    const n = Math.max(1, w.made)
    rows.push({
      t: Math.round((now - t0) / 1000),
      cb: w.cb,
      made: w.made,
      fps: f1(w.made / secs),
      'gap p50/p95/max': `${f1(q(w.gaps, 0.5))} / ${f1(q(w.gaps, 0.95))} / ${f1(Math.max(0, ...w.gaps))}`,
      short: w.gaps.filter((g) => g < 9).length,
      over20: w.gaps.filter((g) => g > 20).length,
      over33: w.gaps.filter((g) => g > 33).length,
      'frame p50/p95': `${f1(q(w.frame, 0.5))} / ${f1(q(w.frame, 0.95))}`,
      upd: f1(w.upd / n),
      draw: f1(w.draw / n),
      draws: w.draws,
      present: f1(w.present / n),
      'queue p50/p95': probeQueue ? `${f1(q(w.gpu, 0.5))} / ${f1(q(w.gpu, 0.95))}` : 'off',
    })
    w = fresh()
  }
  const t0 = performance.now()
  const tick = (now) => {
    raf = requestAnimationFrame(tick)
    w.cb++
    w.gaps.push(now - last)
    last = now
    if (now - w.start >= WINDOW) flush(now)
  }
  raf = requestAnimationFrame(tick)

  window.__frameProfile = {
    rows,
    stop() { cancelAnimationFrame(raf); for (const u of undo.splice(0).reverse()) u(); delete window.__frameProfile },
    report() {
      const env = { ua: navigator.userAgent, dpr: devicePixelRatio, backend: device ? 'WebGPU' : stage ? 'WebGL' : 'n/a', queueProbe: probeQueue, gfx: stage?.gfx, uiPixelRatio: ui.environment?.viewport?.pixelRatio, screen: window.__store?.get?.().screen, stage: stage?.diagnosticState?.() }
      console.log('environment', env)
      console.table(rows)
      const text = JSON.stringify({ env, rows }, null, 1)
      navigator.clipboard?.writeText(text).then(() => console.log('copied to the clipboard'), () => console.log('(clipboard not available: copy the table above)'))
      return text
    },
  }
  console.log('frame profile running: use the app for ~15 s, then run __frameProfile.report()')
})()
