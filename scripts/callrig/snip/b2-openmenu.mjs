export default async ({ page }) => {
  const label = process.env.QA_AL || 'Start or schedule call';
  const hit = await page.evaluate(l => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const b = [...document.querySelectorAll('button')].filter(v)
      .find(x=>(x.getAttribute('aria-label')||'')===l);
    if (!b) return false; b.click(); return true; }, label);
  await page.waitForTimeout(2000);
  return { clicked: hit, items: await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    return [...document.querySelectorAll('[role="menuitem"],[role="menu"] button,[role="dialog"] button')].filter(v)
      .map(e=>({ t:(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,30),
                 disabled: e.getAttribute('aria-disabled')==='true' || e.disabled || false }))
      .filter(e=>e.t); }) };
};
