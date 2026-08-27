import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const out = { reqs: [] };
  page.on('response', async r => { if (/return-request|breakout/.test(r.url())) {
    let body=null; try { body = r.status()>=400 ? (await r.text()).slice(0,240) : null; } catch {}
    out.reqs.push({m:r.request().method(), u:r.url().replace(/https:\/\/[^/]+/,''), s:r.status(), post:r.request().postData(), body}); } });
  await page.keyboard.press('Escape').catch(()=>{}); await page.waitForTimeout(500);
  await page.evaluate(DOM);
  const who = process.env.QA_WHO, item = process.env.QA_ITEM;
  const open = await page.evaluate(() => { const l=document.querySelector('[data-testid="participants-list"]'); return !!l && window.__qa.boxVis(l); });
  if (!open) { await page.locator('button[aria-label="Participants"]').first().click({timeout:15000}).catch(()=>{}); await page.waitForTimeout(2500); }
  await page.evaluate(DOM);
  const pos = await page.evaluate((w) => {
    const rows=[...document.querySelectorAll('[data-testid="participant-row"]')];
    const row=rows.find(r=>r.innerText.includes(w) && !/\(you\)/.test(r.innerText));
    if(!row) return null;
    const b=[...row.querySelectorAll('button')].find(x=>/Participant actions/i.test(x.getAttribute('aria-label')||''));
    if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect();
    return {x:Math.round(r.x+r.width/2), y:Math.round(r.y+r.height/2)};
  }, who);
  out.pos = pos; if(!pos) return out;
  await page.mouse.click(pos.x,pos.y); await page.waitForTimeout(1800);
  await page.evaluate(DOM);
  out.menu = await page.evaluate(() => [...new Set([...document.querySelectorAll('[data-radix-popper-content-wrapper] *')].filter(n=>!n.children.length).filter(window.__qa.vis).map(n=>(n.textContent||'').trim()).filter(Boolean))]);
  const { watchNotices } = await import('./lib.mjs');
  out.notices = await watchNotices(page, { ms: 9000, everyMs: 250, trigger: async () => {
    await page.evaluate((it) => window.__qa.popperPick(new RegExp(it)), item);
  }});
  await page.waitForTimeout(1500);
  return out;
};
