/* sector L: open a tile's action menu and report its items (does not pick) */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  await page.evaluate(DOM);
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  const who = process.env.QA_TARGET || 'QA Bob';
  const out={who};
  out.hover = await page.evaluate((w)=>{
    const hit=[...document.querySelectorAll('[data-testid="participant-tile"]')].find(n=>(n.innerText||'').includes(w));
    if(!hit) return {ok:false};
    const r=hit.getBoundingClientRect();
    return {ok:true, box:{x:Math.round(r.left),y:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height)}};
  }, who);
  if(!out.hover.ok) return out;
  const b=out.hover.box;
  await page.mouse.move(b.x+b.w/2, b.y+b.h/2); await page.waitForTimeout(1000);
  out.open = await page.evaluate((w)=>{
    const hit=[...document.querySelectorAll('[data-testid="participant-tile"]')].find(n=>(n.innerText||'').includes(w));
    const t=hit?[...hit.querySelectorAll('button')].find(x=>x.getAttribute('data-testid')==='participant-tile-card-trigger'):null;
    if(!t) return {ok:false}; t.click(); return {ok:true};
  }, who);
  await page.waitForTimeout(1300);
  out.items = await page.evaluate(()=>{
    const q=window.__qa;
    const w=[...document.querySelectorAll('[data-radix-popper-content-wrapper]')].filter(q.boxVis).pop();
    if(!w) return null;
    const leaves=[...w.querySelectorAll('button,[role=menuitem],li')].filter(q.vis);
    return {text:(w.innerText||'').replace(/\s+/g,' ').trim(),
      controls:leaves.map(n=>({n:q.nameOf(n).replace(/\s+/g,' ').trim().slice(0,50), d:n.disabled||n.getAttribute('aria-disabled')==='true'}))};
  });
  return out;
};
