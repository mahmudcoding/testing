import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const out = {};
  await page.evaluate(DOM);
  const sr = page.locator('button[aria-label="Side Rooms"]').first();
  if ((await sr.getAttribute('aria-pressed')) !== 'true') { await sr.click({timeout:15000}).catch(()=>{}); await page.waitForTimeout(2200); }
  await page.evaluate(DOM);
  out.newBtn = await page.evaluate(() => window.__qa.clickDeepest(/^New Side Room$/));
  await page.waitForTimeout(2200);
  await page.evaluate(DOM);
  out.dialog = await page.evaluate(() => {
    const d=[...document.querySelectorAll('[role=dialog]')].filter(window.__qa.boxVis).filter(x=>x.getAttribute('data-testid')!=='call-overlay-expanded').pop();
    return d?{t:d.innerText.replace(/\s+/g,' ').slice(0,260), btns:[...d.querySelectorAll('button')].filter(window.__qa.vis).map(b=>({n:window.__qa.nameOf(b).slice(0,30),tid:b.getAttribute('data-testid')})), inputs:[...d.querySelectorAll('input')].map(i=>({tid:i.getAttribute('data-testid'),ph:i.placeholder,v:i.value}))}:null;
  });
  const nm = page.locator('[data-testid="side-room-create-name"]').first();
  if (await nm.count()) { await nm.fill(process.env.QA_ROOM || 'Room A'); await page.waitForTimeout(600); }
  await page.evaluate(DOM);
  out.submit = await page.evaluate(() => {
    const d=[...document.querySelectorAll('[role=dialog]')].filter(window.__qa.boxVis).filter(x=>x.getAttribute('data-testid')!=='call-overlay-expanded').pop();
    if(!d) return null; return window.__qa.clickDeepest(/^(Create|Create room|Create side room)$/i, d);
  });
  await page.waitForTimeout(5000);
  await page.evaluate(DOM);
  out.after = await page.evaluate(() => ({
    asides: [...document.querySelectorAll('aside')].filter(window.__qa.boxVis).map(a=>a.innerText.replace(/\s+/g,' ').slice(0,300)),
    btns: [...document.querySelectorAll('button')].filter(window.__qa.vis).map(b=>window.__qa.nameOf(b).replace(/\s+/g,' ').slice(0,40)).filter(Boolean),
    url: location.pathname }));
  out.rooms = await page.evaluate(async (id) => (await (await fetch(`/api/v1/meeting/${id}/breakout-rooms`,{credentials:'include'})).json()), process.env.QA_CALL);
  return out;
};
