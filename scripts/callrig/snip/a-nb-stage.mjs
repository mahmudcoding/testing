import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  return await page.evaluate((v)=>{ const vis=eval(v);
    const ov = document.querySelector('[data-testid="call-overlay-expanded"]') || document.body;
    const tiles = [...ov.querySelectorAll('[data-testid*="tile"],[class*="tile"],[class*="Tile"]')].filter(vis)
      .map(t=>({tid:t.getAttribute('data-testid'), txt:(t.innerText||'').replace(/\s+/g,' ').slice(0,80)}))
      .filter(t=>t.txt);
    const uniq=[]; const seen=new Set();
    for(const t of tiles){ if(!seen.has(t.txt)){ seen.add(t.txt); uniq.push(t); } }
    return {
      txt: (ov.innerText||'').replace(/\s+/g,' ').slice(0,700),
      tiles: uniq.slice(0,12),
      videos: [...ov.querySelectorAll('video')].filter(vis).map(x=>({w:x.videoWidth,h:x.videoHeight,src:!!x.srcObject})),
      inter: [...ov.querySelectorAll('button,[role="tab"],a')].filter(vis)
        .map(b=>({l:(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ').slice(0,40), t:b.getAttribute('data-testid'), sel:b.getAttribute('aria-selected'), p:b.getAttribute('aria-pressed')}))
        .filter(x=>x.l||x.t)
    }; }, VIS);
}
