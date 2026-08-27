export default async ({ page }) => {
  const WS='W4QDF1XTURESO01', CO='O4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/privacy`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(1200);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const api = await page.evaluate(async (CO)=>{
    const j=async u=>{const r=await fetch(u,{credentials:'include'});return r.status;};
    return { roles: await j(`/api/v1/companies/${CO}/roles`), privacy: await j(`/api/v1/users/me/privacy/${CO}`) };
  }, CO);
  const sec = await page.evaluate(() => {
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const main=document.querySelector('main')||document.body;
    const all=(main.innerText||'').replace(/\s+/g,' ');
    const mi=all.indexOf('Messaging & invitations');
    const heads=[...main.querySelectorAll('h1,h2,h3,h4')].filter(vis);
    const h=heads.find(x=>/Messaging & invitations/.test(x.innerText||''));
    let n=0, ctrls=[];
    if (h) { let el=h.parentElement;
      for(let i=0;i<3&&el;i++,el=el.parentElement){
        const c=[...el.querySelectorAll('[role=switch],button,input,select')].filter(vis);
        if(c.length){ n=c.length; ctrls=c.map(x=>(x.getAttribute('aria-label')||x.innerText||'').trim().replace(/\s+/g,' ').slice(0,40)); break; }
      } }
    return { text: mi>=0? all.slice(mi,mi+230):'(absent)', nearControls:n, ctrls: ctrls.slice(0,8) };
  });
  return { api, ...sec };
};
