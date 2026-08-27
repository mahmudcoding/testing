import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const out = {};
  await page.keyboard.press('Escape').catch(()=>{}); await page.waitForTimeout(600);
  await page.evaluate(DOM);
  const b = page.locator('button[aria-label="Side Rooms"]').first();
  out.btnCount = await b.count();
  out.pressed = out.btnCount ? await b.getAttribute('aria-pressed') : null;
  if (out.pressed !== 'true') { await b.click({timeout:15000}).catch(e=>out.clickErr=String(e).slice(0,120)); await page.waitForTimeout(2500); }
  await page.evaluate(DOM);
  out.panel = await page.evaluate(() => {
    const a = [...document.querySelectorAll('aside,[role=dialog],section,div')]
      .filter(window.__qa.boxVis).filter(n=>/Side Room/i.test(n.innerText||''))
      .sort((x,y)=>(x.innerText||'').length-(y.innerText||'').length)[0];
    if(!a) return null;
    return { text: a.innerText.replace(/\s+/g,' ').slice(0,500),
             btns: [...a.querySelectorAll('button')].filter(window.__qa.vis).map(x=>window.__qa.nameOf(x).replace(/\s+/g,' ').slice(0,36)) };
  });
  out.rooms = await page.evaluate(async (id) => {
    const r = await fetch(`/api/v1/meeting/${id}/breakout-rooms`, {credentials:'include'});
    return { s:r.status, b: await r.json().catch(()=>null) };
  }, process.env.QA_CALL);
  return out;
};
