import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const who = process.env.QA_WHO, item = process.env.QA_ITEM, confirmTid = process.env.QA_CONFIRM || '';
  const out = { who, item };
  await page.evaluate(DOM);
  const open = await page.evaluate(() => { const l=document.querySelector('[data-testid="participants-list"]'); return !!l && window.__qa.boxVis(l); });
  if (!open) { await page.locator('button[aria-label="Participants"]').first().click().catch(()=>{}); await page.waitForTimeout(2500); }
  await page.evaluate(DOM);
  const pos = await page.evaluate((w) => {
    const rows=[...document.querySelectorAll('[data-testid="participant-row"]')];
    const row=rows.find(r=>new RegExp(w).test(r.innerText||'') && !/\(you\)/.test(r.innerText||''));
    if(!row) return null;
    const b=[...row.querySelectorAll('button')].find(x=>/Participant actions/i.test(x.getAttribute('aria-label')||''));
    if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect();
    return {x:Math.round(r.x+r.width/2), y:Math.round(r.y+r.height/2)};
  }, who);
  out.pos = pos; if (!pos) return out;
  await page.mouse.click(pos.x, pos.y); await page.waitForTimeout(1800);
  await page.evaluate(DOM);
  out.menu = await page.evaluate(() => [...new Set([...document.querySelectorAll('[data-radix-popper-content-wrapper] *,[role=menuitem]')]
      .filter(n=>!n.children.length).filter(window.__qa.vis).map(n=>(n.textContent||'').trim().replace(/\s+/g,' ')).filter(Boolean))]);
  out.picked = await page.evaluate((it) => window.__qa.popperPick(new RegExp(it)), item);
  await page.waitForTimeout(2200);
  await page.evaluate(DOM);
  out.dialogs = await page.evaluate(() => [...document.querySelectorAll('[role=dialog]')].filter(window.__qa.boxVis)
      .filter(d=>d.getAttribute('data-testid')!=='call-overlay-expanded')
      .map(d=>({tid:d.getAttribute('data-testid'), t:d.innerText.replace(/\s+/g,' ').slice(0,200),
                btns:[...d.querySelectorAll('button')].filter(window.__qa.vis).map(b=>({n:window.__qa.nameOf(b).slice(0,30),tid:b.getAttribute('data-testid')}))})));
  if (confirmTid) {
    const c = page.locator(`[data-testid="${confirmTid}"]`).first();
    if (await c.count()) { await c.click(); out.confirmed = confirmTid; await page.waitForTimeout(3500); }
  }
  await page.evaluate(DOM);
  out.roster = await page.evaluate(() => {
    const l=document.querySelector('[data-testid="participants-list"]'); const host = l ? (l.closest('aside')||l.parentElement) : null;
    return { rows: l?[...l.querySelectorAll('[data-testid="participant-row"]')].map(r=>r.innerText.replace(/\s+/g,' ').trim().slice(0,44)):null,
             panelText: host?host.innerText.replace(/\s+/g,' ').slice(0,300):null };
  });
  return out;
};
