import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const out = {};
  await page.evaluate(DOM);
  const open = await page.evaluate(() => { const l=document.querySelector('[data-testid="participants-list"]'); return !!l && window.__qa.boxVis(l); });
  if (!open) { await page.locator('button[aria-label="Participants"]').first().click().catch(()=>{}); await page.waitForTimeout(2500); }
  await page.evaluate(DOM);
  // open Participant actions on the row that is not "(you)"
  const pos = await page.evaluate((who) => {
    const rows=[...document.querySelectorAll('[data-testid="participant-row"]')];
    const row=rows.find(r=>new RegExp(who).test(r.innerText||'') && !/\(you\)/.test(r.innerText||''));
    if(!row) return null;
    const b=[...row.querySelectorAll('button')].find(x=>/Participant actions/i.test(x.getAttribute('aria-label')||''));
    if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect();
    return {x:Math.round(r.x+r.width/2), y:Math.round(r.y+r.height/2), row: row.innerText.replace(/\s+/g,' ').slice(0,40)};
  }, process.env.QA_WHO || 'QA Bob');
  out.actions = pos;
  if (!pos) return out;
  await page.mouse.click(pos.x, pos.y);
  await page.waitForTimeout(1800);
  await page.evaluate(DOM);
  out.menu = await page.evaluate(() => [...new Set([...document.querySelectorAll('[role=menuitem],[role=menu] button,[data-radix-popper-content-wrapper] *')]
      .filter(n=>!n.children.length).filter(window.__qa.vis).map(n=>(n.textContent||'').trim().replace(/\s+/g,' ')).filter(Boolean))]);
  const r = await page.evaluate(() => window.__qa.popperPick(/Admin permissions/));
  out.pickedAdmin = r;
  await page.waitForTimeout(2500);
  await page.evaluate(DOM);
  out.dialog = await page.evaluate(() => {
    const ds=[...document.querySelectorAll('[role=dialog]')].filter(window.__qa.boxVis)
      .filter(d=>d.getAttribute('data-testid')!=='call-overlay-expanded');
    const d=ds.pop(); if(!d) return null;
    const inputs=[...d.querySelectorAll('input,[role=switch],[role=checkbox]')].map(i=>({
      name: window.__qa.nameOf(i).replace(/\s+/g,' ').slice(0,50), type:i.getAttribute('type')||i.getAttribute('role'),
      checked: i.checked ?? i.getAttribute('aria-checked'), state: i.getAttribute('data-state')||null }));
    return { title:(d.querySelector('h2')?.textContent||'').trim(), inputs,
      btns:[...d.querySelectorAll('button')].filter(window.__qa.vis).map(b=>({n:window.__qa.nameOf(b).replace(/\s+/g,' ').slice(0,40), tid:b.getAttribute('data-testid'), state:b.getAttribute('data-state'), checked:b.getAttribute('aria-checked')})),
      text: d.innerText.replace(/\s+/g,' ').slice(0,600) };
  });
  return out;
};
