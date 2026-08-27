export default async ({ page }) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/account`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const cb = await page.$$('main [role=combobox]');
  const out={ comboboxes: cb.length };
  for (let i=0;i<cb.length;i++){
    const txt = await cb[i].evaluate(e=>(e.innerText||'').trim().slice(0,24));
    if (/English|Русский|Ozbek|O'zbek|Language/i.test(txt)) {
      await cb[i].click().catch(()=>{}); await page.waitForTimeout(1500);
      out.langCombo = txt;
      out.options = await page.evaluate(()=>{
        const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
        return [...document.querySelectorAll('[role=option]')].filter(vis)
          .map(o=>({label:(o.innerText||'').trim().slice(0,26), val:o.getAttribute('data-value')||o.getAttribute('value')||''}));
      });
      await page.keyboard.press('Escape');
      break;
    }
  }
  out.current = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/auth/me',{credentials:'include'});return (await r.json()).settings?.language;});
  return out;
};
