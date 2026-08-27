import { DOM } from './lib.mjs';
import { full, closePeople, closeSideRooms } from './a-callkit.mjs';
export default async ({ page, ctx, browser }) => {
  const out = {};
  await full({page,ctx,browser}); await closePeople(page); await closeSideRooms(page);
  await page.keyboard.press('Escape').catch(()=>{}); await page.waitForTimeout(600);
  await page.evaluate(DOM);
  out.clicked = await page.evaluate(() => window.__qa.clickDeepest(/^End for everyone$/));
  await page.waitForTimeout(2200);
  await page.evaluate(DOM);
  out.dialog = await page.evaluate(() => {
    const d=[...document.querySelectorAll('[role=dialog]')].filter(window.__qa.boxVis).filter(x=>x.getAttribute('data-testid')!=='call-overlay-expanded').pop();
    return d?{t:d.innerText.replace(/\s+/g,' ').slice(0,200), btns:[...d.querySelectorAll('button')].filter(window.__qa.vis).map(b=>({n:(b.innerText||'').trim().slice(0,26),tid:b.getAttribute('data-testid')}))}:null;
  });
  const tid = (out.dialog?.btns||[]).find(b=>/end/i.test(b.n))?.tid;
  if (tid) { await page.locator(`[data-testid="${tid}"]`).first().click().catch(()=>{}); out.confirmed=tid; }
  else { await page.evaluate(() => { const d=[...document.querySelectorAll('[role=dialog]')].filter(window.__qa.boxVis).filter(x=>x.getAttribute('data-testid')!=='call-overlay-expanded').pop(); return d? window.__qa.clickDeepest(/^End (for everyone|call)$/, d):null; }); out.confirmed='by text'; }
  await page.waitForTimeout(8000);
  out.meetings = await page.evaluate(async (ws) => {
    const r=await fetch(`/api/v1/workspace/${ws}/meetings/active`,{credentials:'include'});
    return r.ok ? (await r.json()).meetings.map(m=>({id:m.id,status:m.status,n:m.participant_count})) : r.status;
  }, 'W4QAF1XTURESO01');
  out.url = page.url();
  return out;
};
