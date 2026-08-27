export default async ({ page }) => {
  const set = await page.evaluate((name) => {
    const e = [...document.querySelectorAll('input')].find(i=>i.getBoundingClientRect().width>0 && i.type==='text');
    if (!e) return false;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(e, name);
    e.dispatchEvent(new Event('input', {bubbles:true}));
    e.dispatchEvent(new Event('change', {bubbles:true}));
    return true;
  }, process.env.QA_GUESTNAME || 'Visitor One');
  await page.waitForTimeout(800);
  const btn = await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find(x=>/Ask to join|Join/i.test(x.innerText||''));
    return b ? { text:b.innerText.trim(), disabled:b.disabled } : null; });
  await page.evaluate(() => { const b=[...document.querySelectorAll('button')]
    .find(x=>/Ask to join|Join/i.test(x.innerText||'')); if (b && !b.disabled) b.click(); });
  await page.waitForTimeout(6000);
  return { nameSet: set, buttonBefore: btn, after: await page.evaluate(() => ({
    url: location.pathname,
    text: document.body.innerText.replace(/\n+/g,' | ').slice(0,260),
    buttons: [...document.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width>0)
      .map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean).slice(0,8) })) };
};
