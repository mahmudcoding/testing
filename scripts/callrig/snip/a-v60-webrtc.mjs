const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  await page.waitForTimeout(6000);
  const stats = await page.evaluate(async()=>{
    const pcs=window.__pcs||[]; const out={codecs:{},inbound:[],outbound:[]};
    for(const pc of pcs){ if(pc.connectionState==='closed') continue;
      const s=await pc.getStats(); const codecMap={};
      s.forEach(r=>{ if(r.type==='codec') codecMap[r.id]={mime:r.mimeType,clock:r.clockRate,sdpFmtp:(r.sdpFmtpLine||'').slice(0,40)}; });
      s.forEach(r=>{
        if(r.type==='inbound-rtp'&&r.kind==='video')
          out.inbound.push({w:r.frameWidth,h:r.frameHeight,fps:r.framesPerSecond,dec:r.framesDecoded,
            jitter:r.jitter, jbDelay:r.jitterBufferDelay, jbEmitted:r.jitterBufferEmittedCount,
            codec:codecMap[r.codecId]?.mime, decoder:r.decoderImplementation, pli:r.pliCount, freeze:r.freezeCount});
        if(r.type==='outbound-rtp'&&r.kind==='video')
          out.outbound.push({w:r.frameWidth,h:r.frameHeight,codec:codecMap[r.codecId]?.mime,
            scal:r.scalabilityMode, q:r.qualityLimitationReason, enc:r.encoderImplementation});
      });
      Object.values(codecMap).forEach(c=>{ if(/video/.test(c.mime||'')) out.codecs[c.mime]=c.sdpFmtp; });
    }
    return out;});
  const ui = await page.evaluate((vs)=>{const vis=eval(vs);
    const vids=[...document.querySelectorAll('video')].map(v=>({
      cssW:Math.round(v.getBoundingClientRect().width), cssH:Math.round(v.getBoundingClientRect().height),
      vw:v.videoWidth, vh:v.videoHeight }));
    return { dpr:window.devicePixelRatio, videos:vids,
      breakoutVisible:/breakout/i.test(document.body.innerText),
      sideRoomVisible:/side room/i.test(document.body.innerText),
      countPills:[...document.body.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0&&/^\d+$/.test((e.innerText||'').trim()))
        .map(e=>({n:e.innerText.trim(), al:(e.closest('[aria-label]')?.getAttribute('aria-label')||'').slice(0,30)})).slice(0,6) };},VS);
  return { codecs:stats.codecs, inbound:stats.inbound, outbound:stats.outbound, ui };
};
