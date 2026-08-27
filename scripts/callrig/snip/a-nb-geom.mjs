import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  return await page.evaluate((v)=>{ const vis=eval(v);
    const ov=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const tiles=[...ov.querySelectorAll('[data-testid="participant-tile"]')].filter(vis)
      .map(t=>{ const r=t.getBoundingClientRect();
        const name=(t.querySelector('[data-testid="participant-name"]')||{}).textContent||'';
        const badges=[...t.querySelectorAll('[data-testid],[aria-label]')]
          .map(x=>x.getAttribute('data-testid')||x.getAttribute('aria-label')).filter(Boolean);
        return {name:name.trim().slice(0,20), w:Math.round(r.width), h:Math.round(r.height),
                area:Math.round(r.width*r.height/1000), badges:badges.filter(b=>/pin/i.test(b))}; });
    const toggle=document.querySelector('[data-testid="call-view-toggle"]');
    return {viewToggleLabel: toggle?toggle.getAttribute('aria-label'):null,
      innerWidth: window.innerWidth, tiles}; }, VIS);
}
