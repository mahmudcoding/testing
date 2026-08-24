import { RTC_STATS } from './lib.mjs';
export default async ({page}) => {
  const a = await page.evaluate('('+RTC_STATS+')()');
  await page.waitForTimeout(6000);
  const b = await page.evaluate('('+RTC_STATS+')()');
  const inV = s => s.stats.flatMap(pc=>pc.in.filter(x=>x.kind==='video').map(x=>({w:x.w,h:x.h,fps:x.fps,bytes:x.bytes,dec:x.framesDec})));
  const ui = await page.evaluate(() => {
    const surface = document.querySelector('[role="dialog"]') || document.body;
    const tiles = [...surface.querySelectorAll('[data-testid*="tile"],[data-testid*="participant"]')].map(e=>e.getAttribute('data-testid')+'::'+(e.getAttribute('aria-label')||'').slice(0,40)).slice(0,20);
    const screenLabels = [...surface.querySelectorAll('*')].filter(e=>e.children.length===0 && /'s screen/.test(e.textContent)).map(e=>e.textContent.trim().slice(0,50));
    const vids = [...surface.querySelectorAll('video')].map(v=>({w:v.videoWidth,h:v.videoHeight,paused:v.paused, lbl:(v.closest('[aria-label]')||{}).getAttribute?.('aria-label')||''}));
    return {screenLabels, nVideos: vids.length, vids: vids.slice(0,10),
            pinButtons: [...surface.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||'')).filter(l=>/Pin|Actions for/.test(l)).slice(0,12),
            text: surface.innerText.replace(/\n+/g,' | ').slice(0,300)};
  });
  const before = inV(a), after = inV(b);
  return {ui, inboundVideoBefore: before, inboundVideoAfter: after,
          deltas: after.map((x,i)=>({wh:`${x.w}x${x.h}`, dBytes: x.bytes-(before[i]?before[i].bytes:0), dFrames: x.dec-(before[i]?before[i].dec:0)}))};
};
