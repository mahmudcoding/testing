export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  const res={};
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/roles?scope=company`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4200);
  const openPicker = async (label) => {
    const b = page.locator('main button').filter({hasText:new RegExp('^'+label+'$','i')}).first();
    if(!(await b.count())) return {note:'control not found'};
    await b.click(); await page.waitForTimeout(1800);
    const items = await page.evaluate(()=>{
      const seen=new Set(), o=[];
      document.querySelectorAll('[role="dialog"] *, [data-radix-popper-content-wrapper] *, [role="listbox"] *').forEach(x=>{
        const t=(x.innerText||'').trim();
        const r=x.getBoundingClientRect();
        if(t && t.length<34 && r.width>0 && r.height>0 && x.children.length===0 && !seen.has(t)){seen.add(t); o.push(t);}
      });
      return o.slice(0,14);
    });
    await page.keyboard.press('Escape').catch(()=>{});
    await page.waitForTimeout(700);
    return {count:items.length, items};
  };
  res.memberPicker = await openPicker('Select a member');
  res.rolePicker   = await openPicker('Select a role');
  res.rolesTable = await page.evaluate(()=>{
    const rows=[]; document.querySelectorAll('main tr').forEach(tr=>{const t=(tr.innerText||'').replace(/\s+/g,' ').trim(); if(t) rows.push(t.slice(0,95));});
    return rows;
  });
  return res;
};
