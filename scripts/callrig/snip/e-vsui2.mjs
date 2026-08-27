const WS = 'W4QEF1XTURESO01';
export default async ({ page }) => {
  await page.goto(`https://airion-cargo.store/w/${WS}/c/C4QEGENERAL0001`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3500);
  const btn = await page.$('button[aria-label="Search QA Workspace E"]');
  if (!btn) return { note: 'search button not found' };
  await btn.click();
  await page.waitForTimeout(1500);
  const input = await page.$('[role="dialog"] input:not([type=hidden]), input[type="search"]');
  if (!input) return { note: 'no search input' };
  const runs = [];
  for (const term of ['QA Bob', 'qa-general']) {
    await input.fill('');
    await page.waitForTimeout(300);
    await input.type(term, { delay: 30 });
    await page.waitForTimeout(3000);
    const s = await page.evaluate(() => {
      const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
      const d = document.querySelector('[role="dialog"]') || document.body;
      const tabs = [...d.querySelectorAll('[role="tab"]')].filter(vis).map(b => (b.innerText || '').replace(/\s+/g, ' ').trim());
      const txt = (d.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 300);
      return { tabs, txt };
    });
    runs.push({ term, ...s });
  }
  return runs;
};
