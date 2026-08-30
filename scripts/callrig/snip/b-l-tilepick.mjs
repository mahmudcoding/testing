/* sector L: open a tile's action menu and pick QA_ITEM */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  await page.evaluate(DOM);
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  const who = process.env.QA_TARGET || 'QA Bob';
  const item = process.env.QA_ITEM || 'Unpin for me';
  const out={who,item};
  const b = await page.evaluate((w)=>{
    const hit=[...document.querySelectorAll('[data-testid="participant-tile"]')].find(n=>(n.innerText||'').includes(w));
    if(!hit) return null; const r=hit.getBoundingClientRect();
    return {x:Math.round(r.left),y:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height)};
  }, who);
  if(!b) return {...out, ok:false, why:'no tile'};
  await page.mouse.move(b.x+b.w/2, b.y+b.h/2); await page.waitForTimeout(1000);
  await page.evaluate((w)=>{
    const hit=[...document.querySelectorAll('[data-testid="participant-tile"]')].find(n=>(n.innerText||'').includes(w));
    const t=hit?[...hit.querySelectorAll('button')].find(x=>x.getAttribute('data-testid')==='participant-tile-card-trigger'):null;
    t&&t.click();
  }, who);
  await page.waitForTimeout(1300);
  out.menuBefore = await page.evaluate(()=>{
    const q=window.__qa;
    const w=[...document.querySelectorAll('[data-radix-popper-content-wrapper]')].filter(q.boxVis).pop();
    return w?(w.innerText||'').replace(/\s+/g,' ').trim():null;
  });
  out.pick = await page.evaluate((i)=>{
    const q=window.__qa;
    const w=[...document.querySelectorAll('[data-radix-popper-content-wrapper]')].filter(q.boxVis).pop();
    if(!w) return {ok:false,why:'no popper'};
    const cands=[...w.querySelectorAll('button,[role=menuitem],li')].filter(q.vis)
      .filter(n=>q.nameOf(n).replace(/\s+/g,' ').trim()===i);
    if(cands.length!==1) return {ok:false, why:'want exactly 1 match', got:cands.length,
      all:[...w.querySelectorAll('button,[role=menuitem],li')].filter(q.vis).map(n=>q.nameOf(n).replace(/\s+/g,' ').trim())};
    cands[0].click(); return {ok:true};
  }, item);
  await page.waitForTimeout(2500);
  out.notices = await page.evaluate(()=>window.__qa.notices());
  return out;
};
