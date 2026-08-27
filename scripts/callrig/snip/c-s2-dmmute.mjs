export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const out={reqs:[]};
  const dm=await page.evaluate(()=>{const a=[...document.querySelectorAll('a[href*="/d/"]')]
    .find(x=>/Carol/.test(x.innerText||'')); return a&&a.getAttribute('href');});
  if(!dm){ await page.goto(`https://airion-cargo.store/w/${ws}`); await page.waitForTimeout(5000); }
  const dm2=dm||await page.evaluate(()=>{const a=[...document.querySelectorAll('a[href*="/d/"]')]
    .find(x=>/Carol/.test(x.innerText||'')); return a&&a.getAttribute('href');});
  out.dm=dm2;
  if(!dm2) return out;
  const lsKey='aloqa.channel.mute';
  const ls=()=>page.evaluate((k)=>String(localStorage.getItem(k)).slice(0,160), lsKey);
  out.lsBefore=await ls();
  const onReq=r=>{ if(r.url().includes('/api/v1/')&&r.method()!=='GET')
    out.reqs.push(r.method()+' '+r.url().split('/api/v1')[1].slice(0,50)+' '+(r.postData()||'').slice(0,40)); };
  page.on('request', onReq);
  await page.locator(`a[href="${dm2}"]`).first().click({button:'right'});
  await page.waitForTimeout(1000);
  const it=page.locator('[role="menu"]').getByText('Mute',{exact:true}).first();
  out.menuItem=await it.count();
  if(out.menuItem){ await it.click(); await page.waitForTimeout(1200); }
  // a submenu of durations may open
  out.afterClick=await page.evaluate(()=>{
    const w=document.querySelector('[data-radix-popper-content-wrapper]');
    return {popper: w? (w.innerText||'').replace(/\s+/g,' ').slice(0,80):null,
      menus:document.querySelectorAll('[role="menu"]').length};});
  const dur=page.locator('[role="menu"]').getByText('For 1 hour',{exact:true}).first();
  out.durationItem=await dur.count();
  if(out.durationItem){ await dur.click(); await page.waitForTimeout(2000); }
  else { await page.keyboard.press('Escape'); }
  page.off('request', onReq);
  out.lsAfter=await ls();
  return out;
};
