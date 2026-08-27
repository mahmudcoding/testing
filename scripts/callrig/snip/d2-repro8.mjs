export default async ({ page }) => {
  const WS='W4QDF1XTURESO01'; const out={};
  const stored=()=>page.evaluate(()=>{try{return JSON.parse(localStorage.getItem('aloqa.appearance')||'{}');}catch{return{};}});
  const uiState=()=>page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const main=document.querySelector('main');
    return [...main.querySelectorAll('[role=switch]')].filter(vis).map(s=>{
      let p=s.closest('label')||s.parentElement,l='';
      for(let k=0;k<4&&p;k++,p=p.parentElement){const t=(p.innerText||'').trim(); if(t&&t.length<70){l=t;break;}}
      return {label:l.replace(/\s+/g,' ').slice(0,34), on:s.getAttribute('aria-checked')};
    });
  });
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/appearance`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  out.storedBefore = await stored();
  const before = await uiState();
  const idx = before.findIndex(s=>/Show member roles/i.test(s.label));
  out.target = before[idx];
  if (idx<0) { out.uiBefore=before; return out; }
  const els = await page.$$('main [role=switch]');
  await els[idx].click().catch(()=>{});
  await page.waitForTimeout(2000);
  out.afterClick = (await uiState())[idx];
  out.storedAfterClick = (await stored()).showRoles;
  out.saveBarAppeared = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    return [...document.querySelector('main').querySelectorAll('button')].filter(vis)
      .some(b=>/Save|Discard/i.test(b.innerText||''));
  });
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  out.afterReload = (await uiState())[idx];
  out.storedAfterReload = (await stored()).showRoles;
  return out;
};
