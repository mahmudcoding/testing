import { DOM } from './lib.mjs';
import { openSideRooms, install, rooms } from './a-callkit.mjs';
export default async ({ page }) => {
  const out = {};
  const want = process.env.QA_ROOM || 'Room A';
  await openSideRooms(page);
  await install(page);
  const pos = await page.evaluate((w) => {
    const a=[...document.querySelectorAll('aside')].filter(window.__qa.boxVis).find(x=>/Side Rooms/.test(x.innerText||''));
    if(!a) return null;
    const cards=[...a.querySelectorAll('*')].filter(window.__qa.boxVis)
      .filter(n=>(n.innerText||'').includes(w) && [...n.querySelectorAll('button')].some(b=>/^(Join|Switch|Joined)$/.test(window.__qa.nameOf(b).trim())));
    cards.sort((x,y)=>(x.innerText||'').length-(y.innerText||'').length);
    const c=cards[0]; if(!c) return null;
    const btns=[...c.querySelectorAll('button')].map(b=>({b,n:window.__qa.nameOf(b).trim()})).filter(x=>/^(Join|Switch|Joined)$/.test(x.n));
    if (btns.length!==1) return {ambiguous:btns.map(x=>x.n)};
    if (btns[0].n==='Joined') return {already:true};
    btns[0].b.scrollIntoView({block:'center'}); const r=btns[0].b.getBoundingClientRect();
    return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2),label:btns[0].n};
  }, want);
  out.target = pos;
  if (!pos || pos.already || pos.ambiguous) return out;
  await page.mouse.click(pos.x, pos.y);
  out.clickedAt = Date.now();
  await page.waitForTimeout(2000);
  const c = page.locator('[data-testid="side-room-confirm-submit"]').first();
  if (await c.count()) {
    const p=await c.evaluate(el=>{const r=el.getBoundingClientRect();return{x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};});
    await page.mouse.click(p.x,p.y); out.confirmedAt = Date.now();
  }
  await page.waitForTimeout(5000);
  out.rooms = await rooms(page, process.env.QA_CALL);
  return out;
};
