import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const out = { reqs: [] };
  page.on('response', async r => { if (/\/invite/.test(r.url())) {
    let b=null; try { b = r.status()>=400 ? (await r.text()).slice(0,240) : null; } catch {}
    out.reqs.push({m:r.request().method(), u:r.url().replace(/https:\/\/[^/]+/,''), s:r.status(), post:r.request().postData(), body:b}); } });
  await page.keyboard.press('Escape').catch(()=>{}); await page.waitForTimeout(500);
  await page.evaluate(DOM);
  await page.locator('button[aria-label="Add to call"]').first().click({timeout:15000}).catch(e=>out.err=String(e).slice(0,120));
  await page.waitForTimeout(2500);
  await page.evaluate(DOM);
  out.dialog = await page.evaluate(() => {
    const d=[...document.querySelectorAll('[role=dialog]')].filter(window.__qa.boxVis).filter(x=>x.getAttribute('data-testid')!=='call-overlay-expanded').pop();
    if(!d) return null;
    const rows=[...d.querySelectorAll('button,li,[role=option],[role=checkbox]')].filter(window.__qa.boxVis)
      .map(n=>({t:(n.innerText||'').replace(/\s+/g,' ').trim().slice(0,60), tag:n.tagName, dis:n.disabled||n.getAttribute('aria-disabled'), sel:n.getAttribute('data-selected'), tid:n.getAttribute('data-testid')})).filter(r=>r.t);
    return { text:d.innerText.replace(/\s+/g,' ').slice(0,400), rows };
  });
  const want = process.env.QA_PICK;
  if (want) {
    const hit = await page.evaluate((w) => {
      const d=[...document.querySelectorAll('[role=dialog]')].filter(window.__qa.boxVis).filter(x=>x.getAttribute('data-testid')!=='call-overlay-expanded').pop();
      const cands=[...d.querySelectorAll('button,li,[role=option]')].filter(window.__qa.boxVis).filter(n=>(n.innerText||'').includes(w));
      cands.sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length);
      const c=cands[0]; if(!c) return null; c.scrollIntoView({block:'center'}); const r=c.getBoundingClientRect();
      return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2), t:(c.innerText||'').replace(/\s+/g,' ').slice(0,50)};
    }, want);
    out.pick = hit;
    if (hit) { await page.mouse.click(hit.x,hit.y); await page.waitForTimeout(1500); }
    await page.evaluate(DOM);
    out.afterPick = await page.evaluate(() => {
      const d=[...document.querySelectorAll('[role=dialog]')].filter(window.__qa.boxVis).filter(x=>x.getAttribute('data-testid')!=='call-overlay-expanded').pop();
      return d?{btns:[...d.querySelectorAll('button')].filter(window.__qa.vis).map(b=>({n:(b.innerText||window.__qa.nameOf(b)).replace(/\s+/g,' ').trim().slice(0,26), dis:b.disabled}))}:null;
    });
    if (process.env.QA_SEND) {
      const { watchNotices } = await import('./lib.mjs');
      out.notices = await watchNotices(page, { ms: 9000, everyMs: 250, trigger: async () => {
        await page.evaluate(() => {
          const d=[...document.querySelectorAll('[role=dialog]')].filter(window.__qa.boxVis).filter(x=>x.getAttribute('data-testid')!=='call-overlay-expanded').pop();
          return window.__qa.clickDeepest(/^Invite/, d);
        });
      }});
    }
  }
  return out;
};
