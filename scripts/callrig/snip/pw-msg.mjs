export default async ({page}) => {
  const inp = page.locator('[role="dialog"] input[type=password]').last();
  const snap = async (label) => {
    await page.waitForTimeout(1500);
    return await page.evaluate((label) => {
      const dlg=[...document.querySelectorAll('[role="dialog"]')].pop();
      const i=dlg.querySelector('input[type=password]');
      const wrap = i.closest('div').parentElement;
      return {label,
        len: i.value.length,
        ariaInvalid: i.getAttribute('aria-invalid'), ariaDescribedby: i.getAttribute('aria-describedby'),
        maxlength: i.getAttribute('maxlength'), minlength: i.getAttribute('minlength'),
        validity: {valid: i.validity.valid, tooLong: i.validity.tooLong},
        wrapText: wrap.innerText.replace(/\n+/g,' | ').slice(0,200),
        saveDisabled: document.querySelector('[data-testid="meeting-settings-save"]').disabled,
        saveTitle: document.querySelector('[data-testid="meeting-settings-save"]').getAttribute('title'),
        alerts: [...dlg.querySelectorAll('[role="alert"],[aria-live]')].map(e=>e.innerText.trim().slice(0,120)).filter(Boolean)};
    }, label);
  };
  await inp.fill('a'.repeat(72));
  const at72 = await snap('72');
  await inp.fill('a'.repeat(73));
  const at73 = await snap('73');
  await inp.fill('secret123');
  await page.waitForTimeout(800);
  return {at72, at73};
};
