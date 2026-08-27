export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/roles?scope=company`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4200);
  const res={};
  const b = page.locator('main button').filter({hasText:/^Select a member$/i}).first();
  res.found = await b.count();
  res.expandedBefore = await page.evaluate(()=>{const x=[...document.querySelectorAll('main button')].find(y=>(y.innerText||'').trim()==='Select a member'); return x?x.getAttribute('aria-expanded'):null;});
  await b.click();
  await page.waitForTimeout(2500);
  res.expandedAfter = await page.evaluate(()=>{const x=[...document.querySelectorAll('main button')].find(y=>(y.innerText||'').trim().startsWith('Select a member')); return x?x.getAttribute('aria-expanded'):'button text changed';});
  // dump anything that appeared: popups, inputs, list items — anywhere
  res.appeared = await page.evaluate(()=>{
    const pops=[];
    document.querySelectorAll('[data-radix-popper-content-wrapper],[role="listbox"],[role="menu"],[role="dialog"],[data-state="open"]').forEach(d=>{
      const r=d.getBoundingClientRect();
      pops.push({tag:d.tagName.toLowerCase(), role:d.getAttribute('role')||'', w:Math.round(r.width), h:Math.round(r.height), text:(d.innerText||'').replace(/\s+/g,' ').slice(0,160)});
    });
    const ins=[]; document.querySelectorAll('input').forEach(i=>{const r=i.getBoundingClientRect(); if(r.width>0&&r.height>0) ins.push({ph:i.placeholder||'', al:i.getAttribute('aria-label')||''});});
    return {popups:pops, inputs:ins};
  });
  // if a search box appeared, type into it
  const search = page.locator('input[placeholder*="earch"], [role="dialog"] input, [data-radix-popper-content-wrapper] input').last();
  if (await search.count()) {
    try {
      await search.fill('QA');
      await page.waitForTimeout(2200);
      res.afterTyping = await page.evaluate(()=>{
        const seen=new Set(), o=[];
        document.querySelectorAll('[role="option"],[role="menuitem"],[data-radix-popper-content-wrapper] *,[role="dialog"] *').forEach(x=>{
          const t=(x.innerText||'').trim(); const r=x.getBoundingClientRect();
          if(t && t.length<32 && r.width>0 && r.height>0 && x.children.length===0 && !seen.has(t)){seen.add(t); o.push(t);}
        });
        return o.slice(0,14);
      });
    } catch(e) { res.typeErr=String(e).slice(0,90); }
  }
  await page.keyboard.press('Escape').catch(()=>{});
  return res;
};
