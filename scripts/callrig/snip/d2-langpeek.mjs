export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/account',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const out={};
  out.candidates = await page.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect(); return r.width>2&&r.height>2;};
    return [...document.querySelectorAll('main button,main select,main [role=combobox]')].filter(vis)
      .map((e,i)=>({i, tag:e.tagName.toLowerCase(), role:e.getAttribute('role')||'',
        aria:e.getAttribute('aria-label')||'', txt:(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,30),
        y:Math.round(e.getBoundingClientRect().top)}));
  });
  const idx = out.candidates.findIndex(c=>/language/i.test(c.aria) || /^(English|Русский|O‘zbekcha)$/.test(c.txt));
  out.idx=idx;
  if(idx>=0){
    const el=page.locator('main button,main select,main [role=combobox]').nth(idx);
    await el.scrollIntoViewIfNeeded(); await page.waitForTimeout(400);
    await el.click(); await page.waitForTimeout(2000);
    out.after = await page.evaluate(()=>{
      const vis=el=>{const r=el.getBoundingClientRect(); return r.width>2&&r.height>2;};
      return {options:[...document.querySelectorAll('[role=option],[role=menuitem]')].filter(vis).map(e=>(e.innerText||'').trim()),
        popups:[...document.querySelectorAll('[data-radix-popper-content-wrapper],[role=listbox],[role=menu]')].filter(vis)
          .map(e=>(e.innerText||'').replace(/\s+/g,' ').slice(0,120))};
    });
  }
  return out;
};
