export default async ({page}) => {
  const inp = page.locator('[role="dialog"] input[type=password]').last();
  const out = {};
  for (const v of ['1','ab','   ','12345678901234567890123456789012345678901234567890123456789012345678901234567890']) {
    await inp.fill(v);
    await page.waitForTimeout(700);
    out[JSON.stringify(v).slice(0,30)] = await page.evaluate(() => {
      const dlg=[...document.querySelectorAll('[role="dialog"]')].pop();
      const i=dlg.querySelector('input[type=password]');
      return {value: i.value.length, maxlength: i.getAttribute('maxlength'),
              saveDisabled: (document.querySelector('[data-testid="meeting-settings-save"]')||{}).disabled,
              err: [...dlg.querySelectorAll('*')].filter(e=>e.children.length===0 && /must|at least|invalid|too short|required/i.test(e.textContent)).map(e=>e.textContent.trim().slice(0,90)).slice(0,3)};
    });
  }
  return out;
};
