export default async ({page}) => {
  const net=[];
  page.on('response', async r=>{const u=r.url(); const m=r.request().method(); if(/\/api\/v1\//.test(u)&&m!=='GET'){net.push(`${m} ${r.status()} ${u.replace('https://airion-cargo.store','')}`);} });
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5200);
  const chip = page.locator('button[data-testid="calendar-event-chip"]').filter({hasText:'QA-A-SCHED '}).first();
  const c2 = page.locator('button[data-testid="calendar-event-chip"]').filter({hasText:'QA-A-SCHED'}).first();
  const target = (await chip.count()) ? chip : c2;
  if (!(await target.count())) return {err:'no chip'};
  await target.click(); await page.waitForTimeout(3000);
  const probe = () => { const d=[...document.querySelectorAll('[role="dialog"]')].pop();
    if (!d) return {none:true};
    const b = [...d.querySelectorAll('button')].find(x=>/no longer active/i.test(x.textContent||''));
    const s = b? getComputedStyle(b) : null;
    return {title: d.innerText.split('\n')[0],
      found: !!b, disabled: b? b.disabled : null, ariaDis: b? b.getAttribute('aria-disabled') : null,
      cursor: s? s.cursor : null, opacity: s? s.opacity : null, pe: s? s.pointerEvents : null,
      text: d.innerText.replace(/\n+/g,' | ').slice(0,180)};
  };
  const before = await page.evaluate(probe);
  if (before.found && !before.disabled) {
    const btn = page.locator('[role="dialog"] button').filter({hasText:/no longer active/i}).first();
    await btn.click({force:true}); await page.waitForTimeout(3500);
  }
  const after = await page.evaluate(probe);
  return {before, after, url: page.url(), net};
};
