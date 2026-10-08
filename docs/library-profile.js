// three-ui-specific profiler for real consumer apps exposing window.__ui.
// Paste, interact/scroll for ~15s, then __libraryProfile.report(); __libraryProfile.stop() restores hooks.
// No frame limiter changes, GPU completion probes, forced redraws, or quality changes.
// paint = batch.begin -> batch.end entry (includes any mid-frame capacity flush).
// submit = batch.end CPU (includes renderer); renderer = renderer.render inside ui.render only.
// Nested timings overlap: do not add submit + renderer or draw + update together.
// Upload counts describe queue API payloads, not isolated GPU time or exact transfer bandwidth.
;(() => {
  window.__libraryProfile?.stop()
  const ui = window.__ui
  if (!ui) throw new Error('window.__ui is not set')
  const batch = ui.batch, renderer = ui.renderer || window.__host?.stage?.renderer
  const queue = renderer?.backend?.device?.queue
  const undo = [], rows = [], warnings = [], uploadHooks = {writeBuffer:false,writeTexture:false}
  let uiDepth = 0, paintStart = null, raf = 0, stopped = false
  const now = () => performance.now()
  const origin = now()
  const counters = () => ({layout: ui.stats.layoutPasses, style: ui.stats.styleRecomputes, misses: ui.textLayouts?.misses || 0})
  const fresh = () => ({start: now(), baseline: counters(), draw: [], paint: [], submit: [], renderer: [], update: [], input: {}, bytesBuffer: 0, bytesTexture: 0, writesBuffer: 0, writesTexture: 0, stats: {}, scrollMoves: 0})
  let w = fresh()
  const q = (a,p) => {if(!a.length)return 0;const s=[...a].sort((a,b)=>a-b);return s[Math.min(s.length-1,Math.floor(s.length*p))]}
  const avg = a => a.reduce((a,b)=>a+b,0)/Math.max(1,a.length)
  const round = n => Math.round(n*100)/100
  const timing = a => ({count:a.length,avg:round(avg(a)),p50:round(q(a,.5)),p95:round(q(a,.95)),max:round(Math.max(0,...a))})
  function hook(obj,key,factory) {
    const original=obj?.[key]
    if(typeof original!=='function')return
    const wrapped=factory(original.bind(obj))
    try {obj[key]=wrapped;if(obj[key]!==wrapped)throw Error('not writable')}
    catch(e){warnings.push(`${key}: ${e}`);return}
    undo.push(()=>{if(obj[key]===wrapped)obj[key]=original})
    return true
  }
  hook(ui,'update',original=>(...args)=>{const t=now();try{return original(...args)}finally{w.update.push(now()-t)}})
  hook(batch,'begin',original=>(...args)=>{const result=original(...args);if(uiDepth)paintStart=now();return result})
  hook(batch,'end',original=>(...args)=>{const t=now(),active=uiDepth>0;if(active&&paintStart!==null){w.paint.push(t-paintStart);paintStart=null}try{return original(...args)}finally{if(active)w.submit.push(now()-t)}})
  hook(renderer,'render',original=>(...args)=>{if(!uiDepth)return original(...args);const t=now();try{return original(...args)}finally{w.renderer.push(now()-t)}})
  hook(ui,'render',original=>(...args)=>{const t=now();uiDepth++;try{return original(...args)}finally{uiDepth--;w.draw.push(now()-t);for(const key of ['paintOps','sprites','glyphs','boxes','shadows','nodesPainted','nodesCulled','drawCalls','renderPasses','textureSwitches','clipChanges','retainedOpacityUpdates','replayed'])w.stats[key]=(w.stats[key]||0)+(ui.stats[key]||0)}})
  for(const key of ['pointerDown','pointerMove','pointerUp','wheel','hitTest','hitTestInteractive']) {
    hook(ui.input,key,original=>(...args)=>{const t=now();try{return original(...args)}finally{(w.input[key] ||= []).push(now()-t)}})
  }
  // Counts only uploads during this UI's render, excluding the game scene and composite.
  uploadHooks.writeBuffer = !!hook(queue,'writeBuffer',original=>(buffer,offset,data,dataOffset,size)=>{
    if(uiDepth){const unit=data?.BYTES_PER_ELEMENT||1;w.bytesBuffer+=(size===undefined?Math.max(0,(data?.byteLength||0)-(dataOffset||0)*unit):size*unit);w.writesBuffer++}
    return original(buffer,offset,data,dataOffset,size)
  })
  uploadHooks.writeTexture = !!hook(queue,'writeTexture',original=>(destination,data,layout,size)=>{if(uiDepth){w.bytesTexture+=data?.byteLength||0;w.writesTexture++}return original(destination,data,layout,size)})
  function flush() {
    const t=now(),seconds=(t-w.start)/1000
    if(seconds<.1)return
    const n=Math.max(1,w.draw.length),end=counters()
    rows.push({t:round((t-origin)/1000),seconds:round(seconds),draws:w.draw.length,draw:timing(w.draw),paint:timing(w.paint),submit:timing(w.submit),renderer:timing(w.renderer),update:timing(w.update),input:Object.fromEntries(Object.entries(w.input).map(([k,v])=>[k,timing(v)])),layoutPasses:end.layout-w.baseline.layout,styleRecomputes:end.style-w.baseline.style,textMisses:end.misses-w.baseline.misses,stats:Object.fromEntries(Object.entries(w.stats).map(([k,v])=>[k,round(v/n)])),uploadTotals:{bufferBytes:w.bytesBuffer,texturePayloadBytes:w.bytesTexture,bufferCalls:w.writesBuffer,textureCalls:w.writesTexture},uploadPerDraw:{bufferBytes:round(w.bytesBuffer/n),texturePayloadBytes:round(w.bytesTexture/n),bufferCalls:round(w.writesBuffer/n),textureCalls:round(w.writesTexture/n)},tables:{boxUsed:batch.table?.cursor,boxCapacityBytes:batch.table?.data?.byteLength,clipUsed:batch.clipTable?.cursor,clipCapacityBytes:batch.clipTable?.data?.byteLength},engineNodes:ui.engine?.nodes?.size,engineRunning:ui.engine?.hasRunning,needsRender:ui.needsRender})
    if(rows.length>120)rows.shift()
    w=fresh()
  }
  const tick=()=>{if(stopped)return;if(now()-w.start>=2000)flush();raf=requestAnimationFrame(tick)}
  raf=requestAnimationFrame(tick)
  window.__libraryProfile={rows,warnings,
    report(){flush();const stage=window.__host?.stage;const env={ua:navigator.userAgent,dpr:devicePixelRatio,viewport:ui.environment.viewport,stage:stage?.diagnosticState?.(),uploadHooks,warnings,effects:[...(ui.engine?.nodes || [])].slice(0,64).map(n=>({kind:n.kind,name:n.name,rect:n.getAbsoluteRect(),display:n.computedStyle.display,animations:n._fx?.animations?.map(a=>({name:a.name,state:a.playState})),transitions:n._fx?.transitions?.size}))};console.table(rows.map(r=>({t:r.t,draws:r.draws,draw:r.draw.avg,paint:r.paint.avg,submit:r.submit.avg,renderer:r.renderer.avg,update:r.update.avg,layout:r.layoutPasses,styles:r.styleRecomputes,misses:r.textMisses,bufferKB:round(r.uploadPerDraw.bufferBytes/1024),textureKB:round(r.uploadPerDraw.texturePayloadBytes/1024)})));return JSON.stringify({env,rows},null,1)},
    stop(){stopped=true;cancelAnimationFrame(raf);for(const restore of undo.reverse())restore();delete window.__libraryProfile},
  }
  console.log('Library profile running; no pacing/quality changes. Use __libraryProfile.report() then __libraryProfile.stop().')
})()
