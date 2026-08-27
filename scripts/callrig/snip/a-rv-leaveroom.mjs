import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const out = {};
  await page.evaluate(DOM);
  const pos = await page.evaluate(() => {
    const b=[...document.querySelectorAll('button')].filter(window.__qa.vis)
      .find(x=>/^Leave Side Room$|^Leave room$/i.test(window.__qa.nameOf(x).trim()));
    if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect();
    return {x:Math.round(r.x+r.width/2), y:Math.round(r.y+r.height/2), n:window.__qa.nameOf(b).trim()};
  });
  out.leaveBtn = pos;
  if (!pos) return out;
  await page.mouse.click(pos.x, pos.y);
  await page.waitForTimeout(2200);
  await page.evaluate(DOM);
  out.dialog = await page.evaluate(() => {
    const d=[...document.querySelectorAll('[role=dialog]')].filter(window.__qa.boxVis).filter(x=>x.getAttribute('data-testid')!=='call-overlay-expanded').pop();
    return d?{t:d.innerText.replace(/\s+/g,' ').slice(0,200), btns:[...d.querySelectorAll('button')].filter(window.__qa.vis).map(b=>({n:window.__qa.nameOf(b).slice(0,26),tid:b.getAttribute('data-testid')}))}:null;
  });
  const c = page.locator('[data-testid="side-room-confirm-submit"]').first();
  if (await c.count()) {
    const p = await c.evaluate(el=>{el.scrollIntoView({block:'center'});const r=el.getBoundingClientRect();return{x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};});
    await page.mouse.click(p.x,p.y); out.confirmed=true; await page.waitForTimeout(5000);
  }
  await page.evaluate(DOM);
  out.after = await page.evaluate(() => ({
    asides:[...document.querySelectorAll('aside')].filter(window.__qa.boxVis).map(a=>a.innerText.replace(/\s+/g,' ').slice(0,260)),
    inRoom: [...document.querySelectorAll('button')].filter(window.__qa.vis).some(b=>/Leave Side Room/i.test(window.__qa.nameOf(b)))}));
  out.rooms = await page.evaluate(async (id) => (await (await fetch(`/api/v1/meeting/${id}/breakout-rooms`,{credentials:'include'})).json()), process.env.QA_CALL);
  return out;
};
