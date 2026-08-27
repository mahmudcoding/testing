import { DOM } from './lib.mjs';
import { openSideRooms, rooms, install } from './a-callkit.mjs';
export default async ({ page }) => {
  const out = {};
  const want = process.env.QA_ROOM;
  out.panel = await openSideRooms(page);
  await install(page);
  const pos = await page.evaluate((w) => {
    const a=[...document.querySelectorAll('aside')].filter(window.__qa.boxVis).find(x=>/Side Rooms/.test(x.innerText||''));
    if(!a) return null;
    const cards=[...a.querySelectorAll('*')].filter(window.__qa.boxVis)
      .filter(n=>(n.innerText||'').includes(w) && [...n.querySelectorAll('button')].some(b=>/^Close room$/.test(window.__qa.nameOf(b).trim())));
    cards.sort((x,y)=>(x.innerText||'').length-(y.innerText||'').length);
    const c=cards[0]; if(!c) return null;
    const b=[...c.querySelectorAll('button')].find(x=>/^Close room$/.test(window.__qa.nameOf(x).trim()));
    b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect();
    return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};
  }, want);
  out.pos = pos;
  if (pos) {
    await page.mouse.click(pos.x,pos.y); await page.waitForTimeout(2000);
    const c = page.locator('[data-testid="side-room-confirm-submit"]').first();
    if (await c.count()) { const p=await c.evaluate(el=>{const r=el.getBoundingClientRect();return{x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};}); await page.mouse.click(p.x,p.y); out.confirmed=true; }
    await page.waitForTimeout(5000);
  }
  out.rooms = await rooms(page, process.env.QA_CALL);
  return out;
};
