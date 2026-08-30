/* sector L: encoder pressure — does the adaptive quality surface ever appear, and what
   does the RECEIVING side see while the sender's encoder is starved?
   Driven from alice; reaches bob through the lane-B second() helper. */
import { DOM } from './lib.mjs';
import { second } from './b-second.mjs';

const SEND = `async () => {
  const out = {ui:{}, rtp:null};
  const q = window.__qa;
  const g = t => { const n=document.querySelector('[data-testid="'+t+'"]');
    return n ? {vis:q.boxVis(n), text:(n.innerText||'').replace(/\\s+/g,' ').trim().slice(0,160)} : null; };
  out.ui.prompt  = g('call-quality-prompt');
  out.ui.applied = [...document.querySelectorAll('[data-testid="call-quality-applied"]')].filter(q.boxVis)
      .map(n=>({t:(n.innerText||'').replace(/\\s+/g,' ').trim().slice(0,100), a:n.getAttribute('data-action')}));
  out.ui.mediaErr = g('call-media-error-banner');
  out.ui.lifeErr  = g('call-lifecycle-error-banner');
  out.ui.net = g('call-network-indicator');
  const cb=[...document.querySelectorAll('button')].filter(q.vis).find(x=>/^Turn camera (on|off)$/i.test(q.nameOf(x).trim()));
  out.ui.cam = cb?q.nameOf(cb).trim():null;
  out.ui.notices = q.notices().filter(n=>n.w>40&&n.h>16).map(n=>n.text.slice(0,90));
  for (const pc of (window.__pcs||[])) {
    if (pc.connectionState==='closed') continue;
    const s = await pc.getStats(); const rows=[];
    s.forEach(r=>{ if(r.type==='outbound-rtp'&&r.kind==='video')
      rows.push({b:r.bytesSent, fe:r.framesEncoded, fs:r.framesSent, fps:r.framesPerSecond,
                 w:r.frameWidth, h:r.frameHeight, qlr:r.qualityLimitationReason,
                 qld:r.qualityLimitationDurations, ted:r.totalEncodeTime, rid:r.rid}); });
    if(rows.length){ out.rtp = rows; break; }
  }
  return out;
}`;

const RECV = `() => {
  const q = window.__qa;
  const tile = [...document.querySelectorAll('[data-testid="participant-tile"]')]
      .find(n => /QA Alice/.test(n.innerText||''));
  if (!tile) return {tile:false};
  const v = tile.querySelector('video');
  const pq = v && v.getVideoPlaybackQuality ? v.getVideoPlaybackQuality() : null;
  const ph = tile.querySelector('[data-testid="participant-video-placeholder"]');
  const vm = tile.querySelector('[data-testid="video-muted-icon"]');
  return {tile:true,
    hasVideo: !!v,
    vw: v?v.videoWidth:null, vh: v?v.videoHeight:null,
    paused: v?v.paused:null, ct: v?Math.round(v.currentTime*100)/100:null,
    totalFrames: pq?pq.totalVideoFrames:null, dropped: pq?pq.droppedVideoFrames:null,
    placeholderVis: ph?q.boxVis(ph):false,
    videoMutedIconVis: vm?q.boxVis(vm):false,
    tileText:(tile.innerText||'').replace(/\\s+/g,' ').trim().slice(0,60),
    netInd: (()=>{const n=tile.querySelector('[data-testid="participant-network-indicator"]');
      return n?{vis:q.boxVis(n), aria:n.getAttribute('aria-label'), text:(n.innerText||'').trim().slice(0,30)}:null;})()};
}`;

export default async ({ page, ctx }) => {
  await page.evaluate(DOM);
  const bob = await second('B','bob');
  await bob.page.evaluate(DOM);
  const cdp = await ctx.newCDPSession(page);
  const out={rates:[], bobUrl: bob.page.url()};
  const sample = async (rate, dt) => ({rate, dt,
    send: await page.evaluate(`(${SEND})()`), recv: await bob.page.evaluate(`(${RECV})()`)});

  for (const rate of [1, 4, 10, 20]) {
    await cdp.send('Emulation.setCPUThrottlingRate', {rate});
    const t0=Date.now();
    for(let i=0;i<6;i++){
      await page.waitForTimeout(4000);
      out.rates.push(await sample(rate, Math.round((Date.now()-t0)/1000)));
    }
  }
  await cdp.send('Emulation.setCPUThrottlingRate', {rate:1});
  await page.waitForTimeout(6000);
  out.restored = await sample(1, 6);
  await page.waitForTimeout(8000);
  out.restored2 = await sample(1, 14);
  await bob.browser.close();
  return out;
};
