// A guest that joins and then LEAVES CLEANLY, to contrast with the abrupt teardown.
export default async ({browser}) => {
  const link = process.env.QA_LINK; const name = process.env.QA_GUESTNAME || 'Clean Guest';
  const out={marks:[]}; const t0=Date.now(); const mark=s=>out.marks.push({ms:Date.now()-t0,s});
  const c = await browser.newContext(); const p = await c.newPage();
  await p.goto(link, {waitUntil:'domcontentloaded'}); await p.waitForTimeout(6000);
  const inp = p.locator('input').first();
  if (await inp.count()) { await inp.fill(name); await p.waitForTimeout(500); }
  const b = p.locator('button', {hasText:/Ask to join|Join/i}).first();
  if (await b.count()) await b.click();
  mark('asked');
  for (let i=0;i<30;i++){ await p.waitForTimeout(3000);
    const t = await p.evaluate(()=>(document.body.innerText||'').slice(0,60));
    if(!/Waiting for approval/.test(t)) { mark('admitted'); break; } }
  await p.waitForTimeout(8000);
  out.inCall = await p.evaluate(()=>(document.body.innerText||'').replace(/\s+/g,' ').slice(0,110));
  // clean leave
  await p.mouse.move(700,500); await p.waitForTimeout(500);
  const lv = p.locator('button[aria-label="Leave call"]').first();
  out.leaveBtn = await lv.count();
  if (out.leaveBtn) { await lv.click(); await p.waitForTimeout(2500);
    const cf = p.locator('[data-testid="call-leave-confirm-submit"]').first();
    if (await cf.count()) await cf.click();
    await p.waitForTimeout(6000); }
  mark('left cleanly');
  out.after = await p.evaluate(()=>(document.body.innerText||'').replace(/\s+/g,' ').slice(0,110));
  return out;
};
