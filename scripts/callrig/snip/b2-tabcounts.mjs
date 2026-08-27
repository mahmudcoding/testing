export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QBF1XTURESO01/calls', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const snap = () => page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const tabs = [...document.querySelectorAll('button')].filter(v)
      .filter(b=>/^(All|Group meetings|1-to-1)·/.test(b.textContent.trim()))
      .map(b=>b.textContent.trim().replace(/\s+/g,' '));
    const lm = [...document.querySelectorAll('button')].filter(v).find(b=>/^Load more$/i.test(b.textContent.trim()));
    return { tabs, hasLoadMore: !!lm };
  });
  const steps = [{ step: 'fresh', ...(await snap()) }];
  for (let i = 1; i <= 6; i++) {
    const clicked = await page.evaluate(() => {
      const b = [...document.querySelectorAll('button')].filter(e=>e.getBoundingClientRect().width>0)
        .find(e=>/^Load more$/i.test(e.textContent.trim()));
      if (!b) return false; b.click(); return true; });
    if (!clicked) { steps.push({ step: `after ${i-1} loads`, note: 'Load more gone' }); break; }
    await page.waitForTimeout(2500);
    steps.push({ step: `load ${i}`, ...(await snap()) });
    if (!steps[steps.length-1].hasLoadMore) break;
  }
  // true totals straight from the API, following the cursor
  const api = await page.evaluate(async () => {
    let cursor = null, all = [], guard = 0;
    do {
      const u = '/api/v1/meetings/history?limit=100' + (cursor ? `&before=${encodeURIComponent(cursor)}` : '');
      const r = await fetch(u, {credentials:'include'});
      const j = await r.json();
      const arr = j.meetings || [];
      all = all.concat(arr.map(m => ({ id: m.id, ch: m.channel_id, name: m.name })));
      cursor = j.next_cursor || null; guard++;
    } while (cursor && guard < 10);
    return { total: all.length, pages: guard };
  });
  return { steps, api };
};
