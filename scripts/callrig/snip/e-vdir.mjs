const WS = 'W4QEF1XTURESO01';
export default async ({ page }) => {
  const out = {};
  for (const tab of ['people', 'channels']) {
    await page.goto(`https://airion-cargo.store/w/${WS}/directories?tab=${tab}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3200);
    const input = await page.$('main input:not([type=hidden])');
    if (!input) { out[tab] = { note: 'no filter input' }; continue; }
    const term = tab === 'people' ? 'QA Bob' : 'qa-general';
    await input.fill('');
    await input.type(term, { delay: 30 });
    await page.waitForTimeout(2500);
    out[tab] = await page.evaluate((term) => {
      const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
      const m = document.querySelector('main') || document.body;
      const txt = (m.innerText || '').replace(/\s+/g, ' ').trim();
      return { term, found: txt.includes(term), snippet: txt.slice(0, 220) };
    }, term);
  }
  return out;
};
