const WS = 'W4QEF1XTURESO01';
export default async ({ page }) => {
  await page.goto(`https://airion-cargo.store/w/${WS}/c/C4QEGENERAL0001`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3500);
  await page.keyboard.press('Meta+K');
  await page.waitForTimeout(1200);
  const opened = await page.evaluate(() => !!document.querySelector('[role="dialog"]'));
  if (!opened) return { opened: false, note: 'Cmd+K did not open a dialog' };
  // type a query
  const input = await page.$('[role="dialog"] input:not([type=hidden])');
  if (!input) return { opened: true, note: 'no input in dialog' };
  await input.click();
  await input.fill('QA Bob');
  await page.waitForTimeout(2500);
  const state = await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]');
    if (!d) return null;
    const tabs = [...d.querySelectorAll('[role="tab"],button')].map(b => (b.innerText || '').replace(/\s+/g, ' ').trim()).filter(Boolean).slice(0, 14);
    const txt = (d.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 400);
    return { tabs, txt };
  });
  return { opened: true, query: 'QA Bob', state };
};
