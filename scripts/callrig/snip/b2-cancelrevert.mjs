export default async ({ page }) => {
  const clickReal = async (sel) => {
    const box = await page.evaluate(s => { const e=document.querySelector(s); if(!e) return null;
      const r=e.getBoundingClientRect(); if(r.width===0||r.height===0) return null;
      return { x:r.x+r.width/2, y:r.y+r.height/2 }; }, sel);
    if (!box) return false;
    await page.mouse.move(box.x, box.y); await page.waitForTimeout(180);
    await page.mouse.click(box.x, box.y); return true; };
  const st = () => page.evaluate(() => { const e=document.querySelector('[data-testid="meeting-settings-approval-toggle"]');
    return e ? { checked:e.getAttribute('aria-checked'), visible:e.getBoundingClientRect().width>0 } : 'GONE'; });
  const srv = () => page.evaluate(async (id) => {
    const r = await fetch(`/api/v1/meeting/${id}`, {credentials:'include'});
    const t = await r.text(); const m = t.match(/"requires_approval":(\w+)/); return m ? m[1] : '?';
  }, process.env.QA_MEETING);

  const out = { start: { ui: await st(), server: await srv() } };
  // flip it
  await clickReal('[data-testid="meeting-settings-approval-toggle"]');
  await page.waitForTimeout(1200);
  out.afterToggle = { ui: await st(), server: await srv() };
  // press Cancel
  const cancelSel = await page.evaluate(() => {
    const t = document.querySelector('[data-testid="meeting-settings-approval-toggle"]');
    let root = t; for (let i=0;i<8 && root.parentElement;i++){ root=root.parentElement;
      if ((root.innerText||'').includes('Require approval') && (root.innerText||'').length>200) break; }
    const b = [...root.querySelectorAll('button')].find(x=>/^Cancel$/i.test((x.innerText||'').trim())
      && x.getBoundingClientRect().width>0);
    if (!b) return null;
    b.setAttribute('data-qa-cancel','1'); return '[data-qa-cancel="1"]';
  });
  out.cancelFound = !!cancelSel;
  if (cancelSel) { await clickReal(cancelSel); await page.waitForTimeout(2500); }
  out.afterCancel = { ui: await st(), server: await srv() };
  // close and reopen the panel, then look again
  await clickReal('[data-testid="call-controls-settings-toggle"]'); await page.waitForTimeout(1500);
  await clickReal('[data-testid="call-controls-settings-toggle"]'); await page.waitForTimeout(2200);
  out.afterReopen = { ui: await st(), server: await srv() };
  return out;
};
