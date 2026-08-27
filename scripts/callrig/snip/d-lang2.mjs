export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/account`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const before = await page.evaluate(()=>{
    const m=document.querySelector('main');
    const t=(m.innerText||'').replace(/\s+/g,' ');
    const i=t.indexOf('Region');
    const els=[];
    m.querySelectorAll('button,select,[role="combobox"],[aria-haspopup]').forEach(x=>{
      const r=x.getBoundingClientRect(); if(r.width<=0||r.height<=0) return;
      els.push({tag:x.tagName.toLowerCase(), l:((x.innerText||'').trim()||'?').slice(0,24), role:x.getAttribute('role')||'', haspopup:x.getAttribute('aria-haspopup')||'', expanded:x.getAttribute('aria-expanded')||'', id:(x.id||'').slice(0,20)});
    });
    return {region:t.slice(i,i+160), els};
  });
  const lang = page.locator('main button', {hasText:/^English$/}).first();
  await lang.click();
  await page.waitForTimeout(2500);
  const after = await page.evaluate(()=>{
    // enumerate EVERYTHING that appeared, anywhere in the document
    const pops=[];
    document.querySelectorAll('[data-radix-popper-content-wrapper],[role="listbox"],[role="menu"],[role="dialog"],[data-state="open"]').forEach(d=>{
      const r=d.getBoundingClientRect();
      pops.push({sel:d.getAttribute('role')||d.tagName.toLowerCase(), w:Math.round(r.width), h:Math.round(r.height), text:(d.innerText||'').replace(/\s+/g,' ').slice(0,200)});
    });
    const opts=[];
    document.querySelectorAll('[role="option"],[role="menuitem"],[role="menuitemradio"],li').forEach(x=>{
      const r=x.getBoundingClientRect();
      opts.push({t:(x.innerText||'').trim().slice(0,26), vis:r.width>0&&r.height>0, role:x.getAttribute('role')||x.tagName.toLowerCase()});
    });
    return {popups:pops, options:opts.slice(0,20), expandedNow:document.querySelector('main button[aria-expanded]')?.getAttribute('aria-expanded')};
  });
  return {before, after};
};
