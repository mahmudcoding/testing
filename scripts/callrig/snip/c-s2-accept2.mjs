export default async ({page}) => {
  const ws='W4QCF1XTURESO01', dm='C4OX37SVWDRD28T';
  const now=()=>new Date().toISOString();
  const out={};
  await page.goto('about:blank'); await page.waitForTimeout(1000);
  await page.goto(`https://airion-cargo.store/w/${ws}/d/${dm}`);
  await page.waitForTimeout(9000);
  for(let i=0;i<130;i++){
    const hit=await page.evaluate(()=>{
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
      const btns=[...document.querySelectorAll('button,[role="button"]')].filter(v);
      const b=btns.find(x=>/^(accept|join|answer)$/i.test((x.innerText||'').trim())
        || /accept|join call|answer/i.test(x.getAttribute('aria-label')||''));
      if(b){ b.click(); return b.getAttribute('aria-label')||(b.innerText||'').trim(); }
      return null;});
    if(hit){ out.acceptedAt=now(); out.acceptedVia=hit; break; }
    await page.waitForTimeout(500);
  }
  if(!out.acceptedAt){
    out.lastSeen=await page.evaluate(()=>{
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
      return {url:location.pathname.slice(-22),
        dialogs:[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(v)
          .map(d=>(d.innerText||'').replace(/\s+/g,' ').slice(0,60)),
        buttons:[...document.querySelectorAll('button')].filter(v)
          .map(b=>b.getAttribute('aria-label')).filter(Boolean).slice(0,14)};});
    return out;
  }
  await page.waitForTimeout(14000);
  out.timer=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(v).find(x=>/Call with/.test(x.innerText||''));
    return d? ((d.innerText||'').match(/\d+:\d\d/)||[''])[0]:null;});
  // leave by NAVIGATING AWAY, not by the button
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`);
  out.leftBy='navigate'; out.leftAt=now();
  await page.waitForTimeout(4000);
  out.urlAfter=page.url().slice(-22);
  return out;
};
