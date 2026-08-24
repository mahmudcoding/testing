export default async ({page}) => {
  const inp = page.locator('[role="dialog"] input[type=password]').last();
  const out = [];
  for (const n of [8,16,32,33,40,50,64,65,72]) {
    await inp.fill('a'.repeat(n));
    await page.waitForTimeout(500);
    const r = await page.evaluate(() => {
      const dlg=[...document.querySelectorAll('[role="dialog"]')].pop();
      const sec = [...dlg.querySelectorAll('*')].find(e=>/Password/.test(e.textContent) && e.querySelector('input[type=password]'));
      return {saveDisabled: (document.querySelector('[data-testid="meeting-settings-save"]')||{}).disabled,
              nearbyText: sec? sec.innerText.replace(/\n+/g,' | ').slice(0,220):null,
              anyRed: [...dlg.querySelectorAll('*')].filter(e=>e.children.length===0 && /rgb\(2\d\d, *[0-9]{1,2}, *[0-9]{1,2}\)|red/i.test(getComputedStyle(e).color)).map(e=>e.textContent.trim().slice(0,80)).filter(Boolean).slice(0,3)};
    });
    out.push({n, ...r});
  }
  return out;
};
