export default async ({page}) => {
  const out={reqs:[]};
  const onReq=r=>{ if(r.url().includes('/api/v1/')&&r.method()!=='GET')
    out.reqs.push(r.method()+' '+r.url().split('/api/v1')[1].slice(0,55)+' '+(r.postData()||'').slice(0,40)); };
  const lsSnap=()=>page.evaluate(()=>Object.fromEntries(Object.keys(localStorage)
    .filter(k=>k.startsWith('aloqa')).map(k=>[k,String(localStorage.getItem(k)).slice(0,110)])));
  out.lsBefore=await lsSnap();
  // find a sidebar conversation row
  const rows=page.locator('nav a[href*="/c/"], aside a[href*="/c/"]');
  out.rowCount=await rows.count();
  if(!out.rowCount) return out;
  const row=rows.nth(1);
  out.rowHref=await row.getAttribute('href');
  page.on('request', onReq);
  await row.click({button:'right'});
  await page.waitForTimeout(1000);
  out.menu=await page.evaluate(()=>{
    const wrap=document.querySelector('[data-radix-popper-content-wrapper]')||document.body;
    return [...wrap.querySelectorAll('*')].filter(e=>e.children.length===0)
      .filter(e=>{const r=e.getBoundingClientRect();return r.width>10&&r.height>8;})
      .map(e=>e.textContent.trim().slice(0,26)).filter(Boolean).slice(0,12);
  });
  const pt=await page.evaluate(()=>{
    const w=document.createTreeWalker(document.documentElement,NodeFilter.SHOW_ELEMENT);
    let n; while((n=w.nextNode())){ if(n.children.length) continue;
      if(/^Pin$|^Pin /.test((n.textContent||'').trim())){const r=n.getBoundingClientRect();
        if(r.height>5) return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};} }
    return null;});
  out.pinPt=pt;
  if(pt){ await page.mouse.click(pt.x,pt.y); await page.waitForTimeout(2000); }
  else { await page.keyboard.press('Escape'); }
  page.off('request', onReq);
  out.lsAfter=await lsSnap();
  return out;
};
