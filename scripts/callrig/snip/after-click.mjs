export default async ({page}) => {
  const btn = process.env.QA_BTN;
  const sel = process.env.QA_SEL;
  const el = sel ? await page.$(sel) : await page.$(`button[aria-label="${btn}"]`);
  if (!el) return {err:'missing '+(sel||btn)};
  await el.click();
  await page.waitForTimeout(Number(process.env.QA_WAIT||3000));
  return await page.evaluate(() => {
    const pops = [...document.querySelectorAll('[role="menu"],[role="dialog"],[role="listbox"],[data-radix-popper-content-wrapper]')];
    return {
      pops: pops.map(p=>({role:p.getAttribute('role'), tid:p.getAttribute('data-testid'), text:p.innerText.replace(/\n+/g,' | ').slice(0,500),
                          items:[...p.querySelectorAll('button,[role="menuitem"],[role="option"]')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,40)).filter(Boolean)})),
      toast: [...document.querySelectorAll('[role="status"],[role="alert"],li[data-state]')].map(e=>e.innerText.trim().slice(0,150)).filter(Boolean)
    };
  });
};
