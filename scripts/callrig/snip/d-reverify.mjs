export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  const res={};
  // --- BUG-2: fresh load, hard reload, enumerate again
  await page.goto('https://airion-cargo.store/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(2000);
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/workspace`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  res.bug2 = await page.evaluate(()=>{
    const m=document.querySelector('main');
    const all=[]; m.querySelectorAll('button,a,[role="button"],[role="menuitem"],select,summary').forEach(x=>{
      const r=x.getBoundingClientRect(); if(r.width<=0||r.height<=0) return;
      all.push(((x.innerText||'').trim()||x.getAttribute('aria-label')||'?').slice(0,34));
    });
    const t=(m.innerText||'').replace(/\s+/g,' ');
    const i=t.indexOf('Danger zone');
    return {dangerZone:t.slice(i,i+200), transferControls:all.filter(l=>/transfer|ownership/i.test(l)), totalControls:all.length};
  });
  // --- BUG-4: fresh load of the identity section
  res.bug4 = await page.evaluate(()=>{
    const m=document.querySelector('main');
    const t=(m.innerText||'').replace(/\s+/g,' ');
    const i=t.indexOf('Workspace identity');
    const ins=[]; m.querySelectorAll('input,select,textarea').forEach(x=>{const r=x.getBoundingClientRect(); if(r.width>0&&r.height>0) ins.push({al:x.getAttribute('aria-label')||'', ph:x.placeholder||'', val:(x.value||'').slice(0,30), t:x.type});});
    return {subtitle:t.slice(i,i+120), inputs:ins};
  });
  // --- BUG-3: fresh load of roles, both scopes
  const roleScan = async (scope) => {
    await page.goto(`https://airion-cargo.store/w/${WS}/settings/roles?scope=${scope}`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(4500);
    return await page.evaluate(()=>{
      const m=document.querySelector('main');
      const labs=[]; m.querySelectorAll('label').forEach(x=>{const r=x.getBoundingClientRect(); if(r.width>0&&r.height>0){const s=(x.innerText||'').trim(); if(s) labs.push(s.slice(0,60));}});
      return {rawKeys:labs.filter(l=>/^[a-z][a-z0-9]*\.[a-z0-9.*]+$/.test(l)), total:labs.length};
    });
  };
  res.bug3company = await roleScan('company');
  res.bug3workspace = await roleScan('workspace');
  return res;
};
