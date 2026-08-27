export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/roles?scope=workspace`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  return await page.evaluate(()=>{
    const rows=[]; document.querySelectorAll('main tr').forEach(tr=>{const t=(tr.innerText||'').replace(/\s+/g,' ').trim(); if(t) rows.push(t.slice(0,95));});
    const trig=[]; document.querySelectorAll('main [role="combobox"]').forEach(x=>{const r=x.getBoundingClientRect(); if(r.width>0&&r.height>0) trig.push({t:(x.innerText||'').trim().slice(0,20), exp:x.getAttribute('aria-expanded')});});
    return {rows, comboboxes:trig};
  });
};
