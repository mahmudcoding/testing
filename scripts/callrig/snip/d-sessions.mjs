export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/sessions`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const dom = await page.evaluate(()=>{
    const m=document.querySelector('main')||document.body;
    const ctl=[];
    m.querySelectorAll('button,a,[role="button"],[role="menuitem"],input,select').forEach(x=>{
      const r=x.getBoundingClientRect();
      ctl.push({tag:x.tagName.toLowerCase(), l:((x.innerText||'').trim()||x.getAttribute('aria-label')||'?').slice(0,40), vis:r.width>0&&r.height>0, dis:!!x.disabled});
    });
    return {text:(m.innerText||'').replace(/\s+/g,' ').slice(140,1200), controls:ctl};
  });
  const api = await page.evaluate(async()=>{
    const out=[];
    for (const u of ['/api/v1/auth/sessions','/api/v1/users/me/sessions','/api/v1/sessions']) {
      try{const r=await fetch(u,{credentials:'include'});const t=await r.text();out.push({u,s:r.status,len:t.length,b:t.slice(0,400)});}catch(e){out.push({u,e:String(e).slice(0,60)});}
    }
    return out;
  });
  return {dom, api};
};
