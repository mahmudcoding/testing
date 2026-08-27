const WS = 'W4QEF1XTURESO01';
export default async ({ page }) => {
  await page.goto(`https://airion-cargo.store/w/${WS}/c/C4QEGENERAL0001`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3500);
  await (await page.$('button[aria-label="Search QA Workspace E"]')).click();
  await page.waitForTimeout(1500);
  const input = await page.$('[role="dialog"] input:not([type=hidden]), input[type="search"]');
  const runs = [];
  for (const term of [':@ QA Bob', ':@ Bob', ':@Bob', ':in #qa-general', '#qa-general', '@QA Bob']) {
    await input.fill('');
    await page.waitForTimeout(400);
    await input.type(term, { delay: 25 });
    await page.waitForTimeout(2800);
    const s = await page.evaluate(() => {
      const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
      const d = document.querySelector('[role="dialog"]') || document.body;
      return {
        tabs: [...d.querySelectorAll('[role="tab"]')].filter(vis).map(b => (b.innerText || '').replace(/\s+/g, ' ').trim()),
      };
    });
    runs.push({ term, tabs: s.tabs });
  }
  return runs;
};
