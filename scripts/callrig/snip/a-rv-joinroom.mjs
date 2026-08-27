import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const out = {};
  await page.keyboard.press('Escape').catch(()=>{}); await page.waitForTimeout(500);
  await page.evaluate(DOM);
  const sr = page.locator('button[aria-label="Side Rooms"]').first();
  out.srBtn = await sr.count();
  if (out.srBtn && (await sr.getAttribute('aria-pressed')) !== 'true') { await sr.click({timeout:15000}).catch(e=>out.err=String(e).slice(0,100)); await page.waitForTimeout(2500); }
  await page.evaluate(DOM);
  out.aside = await page.evaluate(() => [...document.querySelectorAll('aside')].filter(window.__qa.boxVis).map(a=>a.innerText.replace(/\s+/g,' ').slice(0,300)));
  const want = process.env.QA_ROOM || 'Room A';
  const pos = await page.evaluate((w) => {
    const a=[...document.querySelectorAll('aside')].filter(window.__qa.boxVis).find(x=>/Side Rooms/.test(x.innerText||''));
    if(!a) return null;
    // the room card: smallest visible element containing the room name and a Join/Switch button
    const cands=[...a.querySelectorAll('*')].filter(window.__qa.boxVis)
      .filter(n=>(n.innerText||'').includes(w) && [...n.querySelectorAll('button')].some(b=>/^(Join|Switch)$/.test(window.__qa.nameOf(b).trim())));
    cands.sort((x,y)=>(x.innerText||'').length-(y.innerText||'').length);
    const card=cands[0]; if(!card) return null;
    const b=[...card.querySelectorAll('button')].find(x=>/^(Join|Switch)$/.test(window.__qa.nameOf(x).trim()));
    b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect();
    return {x:Math.round(r.x+r.width/2), y:Math.round(r.y+r.height/2), label:window.__qa.nameOf(b).trim(), card:(card.innerText||'').replace(/\s+/g,' ').slice(0,80)};
  }, want);
  out.joinBtn = pos;
  if (!pos) return out;
  await page.mouse.click(pos.x, pos.y);
  await page.waitForTimeout(2200);
  await page.evaluate(DOM);
  out.dialog = await page.evaluate(() => {
    const d=[...document.querySelectorAll('[role=dialog]')].filter(window.__qa.boxVis).filter(x=>x.getAttribute('data-testid')!=='call-overlay-expanded').pop();
    return d?{t:d.innerText.replace(/\s+/g,' ').slice(0,200), btns:[...d.querySelectorAll('button')].filter(window.__qa.vis).map(b=>({n:window.__qa.nameOf(b).slice(0,26),tid:b.getAttribute('data-testid')}))}:null;
  });
  const c = page.locator('[data-testid="side-room-confirm-submit"]').first();
  if (await c.count()) { const p=await c.evaluate(el=>{el.scrollIntoView({block:'center'});const r=el.getBoundingClientRect();return{x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};}); await page.mouse.click(p.x,p.y); out.confirmed=true; }
  await page.waitForTimeout(6000);
  await page.evaluate(DOM);
  out.after = await page.evaluate(() => ({
    inRoom: [...document.querySelectorAll('button')].filter(window.__qa.vis).some(b=>/Leave Side Room/i.test(window.__qa.nameOf(b))),
    asides: [...document.querySelectorAll('aside')].filter(window.__qa.boxVis).map(a=>a.innerText.replace(/\s+/g,' ').slice(0,260)) }));
  out.rooms = await page.evaluate(async (id) => ((await (await fetch(`/api/v1/meeting/${id}/breakout-rooms`,{credentials:'include'})).json()).rooms||[]).map(r=>({n:r.name,s:r.status,c:r.participant_count})), process.env.QA_CALL);
  return out;
};
