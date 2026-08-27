import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const out = {};
  await page.keyboard.press('Escape').catch(()=>{}); await page.waitForTimeout(500);
  await page.evaluate(DOM);
  const b = page.locator('button[aria-label="Send reaction"]').first();
  out.btn = await b.count();
  if (!out.btn) return out;
  await b.click({timeout:15000}).catch(e=>out.err=String(e).slice(0,120));
  await page.waitForTimeout(1800);
  await page.evaluate(DOM);
  out.picker = await page.evaluate(() => {
    const w=[...document.querySelectorAll('[data-radix-popper-content-wrapper],[role=menu],[role=dialog]')].filter(window.__qa.boxVis)
      .filter(n=>n.getAttribute('data-testid')!=='call-overlay-expanded').pop();
    if(!w) return null;
    return { text:w.innerText.replace(/\s+/g,' ').slice(0,200),
      btns:[...w.querySelectorAll('button')].filter(window.__qa.vis).map(x=>({n:(x.innerText||window.__qa.nameOf(x)).trim().slice(0,12), tid:x.getAttribute('data-testid')})) };
  });
  const want = process.env.QA_EMOJI;
  if (want) {
    const hit = await page.evaluate((w) => {
      const wr=[...document.querySelectorAll('[data-radix-popper-content-wrapper],[role=menu],[role=dialog]')].filter(window.__qa.boxVis)
        .filter(n=>n.getAttribute('data-testid')!=='call-overlay-expanded').pop();
      const b=[...wr.querySelectorAll('button')].find(x=>(x.innerText||'').includes(w));
      if(!b) return null; const r=b.getBoundingClientRect();
      return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};
    }, want);
    out.pick = hit;
    if (hit) { await page.mouse.click(hit.x,hit.y); out.sentAt = new Date().toISOString(); await page.waitForTimeout(2500); }
  }
  return out;
};
