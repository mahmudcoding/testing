export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  const res={};
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/invites`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  res.initial = await page.evaluate(()=>{
    const m=document.querySelector('main');
    const b=[]; m.querySelectorAll('button').forEach(x=>{const r=x.getBoundingClientRect(); if(r.width>0&&r.height>0) b.push({l:((x.innerText||'').trim()||x.getAttribute('aria-label')||'?').slice(0,34), dis:!!x.disabled});});
    return {text:(m.innerText||'').replace(/\s+/g,' ').slice(150,900), btns:b};
  });
  // open the role picker
  const sel = page.locator('main button', {hasText:/Select a role/i}).first();
  res.hasSelect = await sel.count();
  if (res.hasSelect) {
    await sel.click();
    await page.waitForTimeout(2000);
    res.afterOpen = await page.evaluate(()=>{
      // look at any popup/listbox/menu anywhere in the document
      const cont=[];
      document.querySelectorAll('[role="listbox"],[role="menu"],[role="dialog"],[data-radix-popper-content-wrapper]').forEach(d=>{
        const r=d.getBoundingClientRect(); if(r.width<=0||r.height<=0) return;
        const opts=[]; d.querySelectorAll('[role="option"],[role="menuitem"],li,button').forEach(o=>{const q=o.getBoundingClientRect(); if(q.width>0&&q.height>0) opts.push(((o.innerText||'').trim()||'?').slice(0,40));});
        cont.push({text:(d.innerText||'').replace(/\s+/g,' ').slice(0,200), optionCount:opts.length, options:opts.slice(0,12)});
      });
      return cont;
    });
    // pick the first option if there is one
    const opt = page.locator('[role="option"],[role="menuitem"]').first();
    if (await opt.count()) {
      res.picked = ((await opt.innerText())||'').trim().slice(0,40);
      await opt.click(); await page.waitForTimeout(1800);
      res.afterPick = await page.evaluate(()=>{const m=document.querySelector('main');const b=[];m.querySelectorAll('button').forEach(x=>{const r=x.getBoundingClientRect();if(r.width>0&&r.height>0)b.push({l:((x.innerText||'').trim()||x.getAttribute('aria-label')||'?').slice(0,34),dis:!!x.disabled});});return b;});
    } else res.picked='NO OPTIONS IN THE LIST';
  }
  return res;
};
