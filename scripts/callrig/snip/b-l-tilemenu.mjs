/* sector L: what a participant tile offers — hover menu, pin controls */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  await page.evaluate(DOM);
  const target = process.env.QA_TARGET || 'QA Bob';
  const out={target};
  // find the tile whose text names the target
  out.tile = await page.evaluate((t)=>{
    const q=window.__qa;
    const tiles=[...document.querySelectorAll('[data-testid="participant-tile"]')];
    const hit=tiles.find(n=>(n.innerText||'').includes(t));
    if(!hit) return {ok:false, seen:tiles.map(n=>(n.innerText||'').replace(/\s+/g,' ').trim().slice(0,30))};
    const r=hit.getBoundingClientRect();
    return {ok:true, box:{x:Math.round(r.left),y:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height)},
      buttonsBeforeHover:[...hit.querySelectorAll('button')].map(b=>({n:q.nameOf(b).trim().slice(0,40), vis:q.vis(b)})),
      testids:[...new Set([...hit.querySelectorAll('[data-testid]')].map(n=>n.getAttribute('data-testid')))]};
  }, target);
  if(!out.tile.ok) return out;
  const b=out.tile.box;
  await page.mouse.move(b.x+b.w/2, b.y+b.h/2);
  await page.waitForTimeout(1200);
  out.onHover = await page.evaluate((t)=>{
    const q=window.__qa;
    const hit=[...document.querySelectorAll('[data-testid="participant-tile"]')].find(n=>(n.innerText||'').includes(t));
    if(!hit) return null;
    return {buttons:[...hit.querySelectorAll('button')].map(x=>({n:q.nameOf(x).trim().slice(0,45), vis:q.vis(x),
      testid:x.getAttribute('data-testid')||null, exp:x.getAttribute('aria-expanded')})),
      testids:[...new Set([...hit.querySelectorAll('[data-testid]')].map(n=>n.getAttribute('data-testid')))]};
  }, target);
  // click any menu trigger on the tile
  out.openMenu = await page.evaluate((t)=>{
    const q=window.__qa;
    const hit=[...document.querySelectorAll('[data-testid="participant-tile"]')].find(n=>(n.innerText||'').includes(t));
    if(!hit) return {ok:false};
    const b=[...hit.querySelectorAll('button')].filter(q.vis).find(x=>x.getAttribute('aria-haspopup')||/more|option|menu/i.test(q.nameOf(x)));
    if(!b) return {ok:false, why:'no menu trigger', names:[...hit.querySelectorAll('button')].filter(q.vis).map(q.nameOf)};
    b.click(); return {ok:true, n:q.nameOf(b).trim()};
  }, target);
  await page.waitForTimeout(1400);
  out.menu = await page.evaluate(()=>{
    const q=window.__qa;
    const wraps=[...document.querySelectorAll('[data-radix-popper-content-wrapper],[role=menu]')].filter(q.boxVis);
    return wraps.map(w=>({text:(w.innerText||'').replace(/\s+/g,' ').trim().slice(0,400)}));
  });
  return out;
};
