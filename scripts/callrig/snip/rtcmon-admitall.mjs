export default async ({page}) => {
  const steps=[];
  // close any invite dialog, open people panel
  await page.evaluate(()=>{ const c=[...document.querySelectorAll('button')].find(b=>/^close$/i.test((b.getAttribute('aria-label')||b.textContent||'').trim())); if(c)c.click(); });
  await page.waitForTimeout(1500);
  const toggle = page.locator('[data-testid="call-controls-people-toggle"]').first();
  if (await toggle.count() && (await toggle.getAttribute('aria-pressed')) !== 'true') { await toggle.click().catch(()=>{}); await page.waitForTimeout(2500); }
  for (let round=0; round<12; round++) {
    const r = await page.evaluate(() => {
      const all=[...document.querySelectorAll('button')].filter(b=>b.offsetParent);
      const admitAll = all.find(b=>/admit all/i.test((b.textContent||'').trim()));
      if (admitAll) { admitAll.click(); return 'admit-all'; }
      const one = all.find(b=>/^admit$/i.test((b.textContent||'').trim()));
      if (one) { one.click(); return 'admit-one'; }
      return 'none';
    });
    if (r === 'none') { steps.push('round '+round+': nothing left'); break; }
    steps.push('round '+round+': '+r);
    await page.waitForTimeout(2200);
  }
  await page.waitForTimeout(4000);
  steps.push('participants text: ' + await page.evaluate(()=>((document.body.innerText.match(/(\d+)\s+in call/)||[])[1]||'?')));
  steps.push('tiles: ' + await page.evaluate(()=>document.querySelectorAll('[data-testid="participant-tile"]').length));
  return steps;
};
