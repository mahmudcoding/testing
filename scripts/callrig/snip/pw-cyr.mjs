export default async ({page}) => {
  const inp = page.locator('[role="dialog"] input[type=password]').last();
  const out = [];
  const cases = [['cyr36','п'.repeat(36)],['cyr37','п'.repeat(37)],['emoji18','🎉'.repeat(18)],['emoji19','🎉'.repeat(19)]];
  for (const [k,v] of cases) {
    await inp.fill(v);
    await page.waitForTimeout(1300);
    out.push(await page.evaluate((k) => {
      const dlg=[...document.querySelectorAll('[role="dialog"]')].pop();
      const i=dlg.querySelector('input[type=password]');
      const id=i.getAttribute('aria-describedby'); const m=id&&document.getElementById(id);
      return {k, chars:i.value.length, bytes: new TextEncoder().encode(i.value).length,
              invalid:i.getAttribute('aria-invalid'), msg: m? m.textContent.trim().slice(0,110):null,
              saveDisabled: document.querySelector('[data-testid="meeting-settings-save"]').disabled};
    }, k));
  }
  await inp.fill('secret123');
  await page.waitForTimeout(900);
  return out;
};
