import { DOM } from './lib.mjs';
export default async ({page}) => {
  await page.evaluate(DOM);
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  const b = await page.$('button[aria-label="Side Rooms"]');
  const out = {btnPresent: !!b};
  if (b) { const p = await b.getAttribute('aria-pressed'); out.pressed = p;
    if (p !== 'true') { const bb = await b.boundingBox(); await page.mouse.click(bb.x+bb.width/2, bb.y+bb.height/2); await page.waitForTimeout(2500); } }
  out.panel = await page.evaluate(() => {
    const q=window.__qa; const vis=(e)=>q.vis(e)||q.boxVis(e);
    const T=(e)=>(e.innerText||'').replace(/\s+/g,' ').trim();
    const p=[...document.querySelectorAll('[data-testid="call-side-panel-slot"]')].filter(vis)[0];
    if(!p) return null;
    const r=p.getBoundingClientRect();
    return {rect:[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)],
      text:T(p),
      controls:[...p.querySelectorAll('button,input,[role=switch],[role=checkbox]')].filter(vis).map(x=>({
        l:(x.getAttribute('aria-label')||x.textContent||x.placeholder||'').replace(/\s+/g,' ').trim().slice(0,60),
        t:x.getAttribute('data-testid'), d:x.disabled||x.getAttribute('aria-disabled')==='true',
        st:x.getAttribute('aria-checked')||x.getAttribute('data-state')}))};
  });
  return out;
};
