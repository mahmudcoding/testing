export default async ({page}) => {
  const out={reqs:[]};
  const onReq=r=>{ if(r.url().includes('/api/v1/')&&r.method()!=='GET')
    out.reqs.push(r.method()+' '+r.url().split('/api/v1')[1].slice(0,50)+' '+(r.postData()||'').slice(0,50)); };
  const dm=await page.evaluate(()=>{const a=[...document.querySelectorAll('a[href*="/d/"]')]
    .find(a=>a.getBoundingClientRect().height>0); return a&&a.getAttribute('href');});
  out.dm=dm;
  const lsAll=()=>page.evaluate(()=>Object.fromEntries(Object.keys(localStorage)
    .filter(k=>k.startsWith('aloqa')).map(k=>[k,String(localStorage.getItem(k)).length])));
  out.lsBefore=await lsAll();
  const order=()=>page.evaluate(()=>[...document.querySelectorAll('a[href*="/d/"]')]
    .filter(a=>a.getBoundingClientRect().height>0).map(a=>(a.innerText||'').replace(/\s+/g,' ').slice(0,22)));
  out.orderBefore=await order();
  page.on('request', onReq);
  await page.locator(`a[href="${dm}"]`).first().click({button:'right'});
  await page.waitForTimeout(1000);
  const item=page.locator('[role="menu"]').getByText('Pin', {exact:true}).first();
  out.itemCount=await item.count();
  if(out.itemCount){ await item.click(); await page.waitForTimeout(2200); }
  else await page.keyboard.press('Escape');
  page.off('request', onReq);
  out.orderAfter=await order();
  out.lsAfter=await lsAll();
  out.lsNew=Object.keys(out.lsAfter).filter(k=>!(k in out.lsBefore));
  out.lsChanged=Object.keys(out.lsAfter).filter(k=>k in out.lsBefore && out.lsAfter[k]!==out.lsBefore[k]);
  // does it survive a reload?
  await page.reload(); await page.waitForTimeout(5000);
  out.orderAfterReload=await order();
  out.menuAfterReload=await (async()=>{
    await page.locator(`a[href="${dm}"]`).first().click({button:'right'});
    await page.waitForTimeout(1000);
    const t=await page.evaluate(()=>{const m=document.querySelector('[role="menu"]');return m?(m.innerText||'').replace(/\s+/g,' ').slice(0,120):'none';});
    await page.keyboard.press('Escape'); return t;
  })();
  return out;
};
