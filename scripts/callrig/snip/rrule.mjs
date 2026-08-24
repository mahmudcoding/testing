export default async ({page}) => {
  await page.fill('[role="dialog"] input[aria-label="Ends time"]', '15:00');
  await page.waitForTimeout(700);
  const b = page.locator('[role="dialog"] button', {hasText:'Custom RRULE'}).first();
  if (!(await b.count())) return {err:'no rrule btn'};
  await b.click();
  await page.waitForTimeout(1800);
  return await page.evaluate(() => {
    const d=[...document.querySelectorAll('[role="dialog"]')].pop();
    return {text: d.innerText.replace(/\n+/g,' | ').slice(0,900),
      fields: [...d.querySelectorAll('input,select,textarea')].map(i=>`${i.tagName}:${i.type||''}|${i.getAttribute('data-testid')||i.id||''}|${i.placeholder||''}|${i.getAttribute('aria-label')||''}|val=${(i.value||'').slice(0,40)}`),
      buttons: [...d.querySelectorAll('button')].map(x=>`${(x.getAttribute('aria-label')||x.textContent||'').trim().slice(0,36)}`).slice(0,25)};
  });
};
