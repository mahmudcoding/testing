import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  await page.mouse.move(700,400); await page.waitForTimeout(400);
  return await page.evaluate((v)=>{ const vis=eval(v);
    const ov = document.querySelector('[data-testid="call-overlay-expanded"]') || document.body;
    const tiles=[...ov.querySelectorAll('[data-testid="participant-tile"]')].filter(vis).map(t=>{
      const r=t.getBoundingClientRect(); const vid=t.querySelector('video');
      return {who:(t.querySelector('[data-testid="participant-name"]')?.textContent||'').trim().slice(0,20),
        box:`${Math.round(r.width)}x${Math.round(r.height)} @${Math.round(r.left)},${Math.round(r.top)}`,
        area:Math.round(r.width*r.height/1000),
        vid: vid?`${vid.videoWidth}x${vid.videoHeight}${vid.paused?' PAUSED':''}`:null,
        marks:[...t.querySelectorAll('[data-testid]')].map(y=>y.getAttribute('data-testid'))
              .filter(x=>/pin|spotlight|hand|away|speaking/.test(x))};
    });
    const view=[...document.querySelectorAll('button')].filter(vis)
      .map(b=>(b.getAttribute('aria-label')||'').trim()).filter(x=>/view$|fullscreen/i.test(x));
    const others=[...ov.querySelectorAll('[data-testid]')].filter(vis)
      .map(x=>x.getAttribute('data-testid')).filter(x=>/filmstrip|stage|spotlight|carousel|pager|overflow/i.test(x));
    return {vw:innerWidth+'x'+innerHeight, viewBtns:view, tiles, stageMarks:[...new Set(others)].slice(0,12)};
  }, VIS);
};
