export default async ({page}) => {
  const out={};
  await page.goto('https://airion-cargo.store/',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  out.landed = page.url();
  out.api = await page.evaluate(async()=>{
    const g=async u=>{try{const r=await fetch(u,{credentials:'include'});return await r.json();}catch{return null;}};
    const co=await g('/api/v1/users/me/companies'), ws=await g('/api/v1/users/me/workspaces');
    const first=(co&&co.companies||[])[0];
    const cws=first?await g(`/api/v1/companies/${first.id}/workspaces`):null;
    return {companies:(co&&co.companies||[]).map(c=>c.name),
      myWorkspaces:(ws&&ws.workspaces||[]).map(w=>`${w.name} (${w.type})`),
      workspacesInNewCompany: cws? (cws.workspaces||cws||[]).length : 'n/a'};
  });
  // the settings/company page it dropped us on
  await page.goto(out.landed.includes('settings') ? out.landed : 'https://airion-cargo.store'+ (await page.evaluate(()=>location.pathname)), {waitUntil:'domcontentloaded'}).catch(()=>{});
  await page.waitForTimeout(3000);
  out.settingsCompany = await page.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect();return r.width>2&&r.height>2;};
    const m=document.querySelector('main')||document.body;
    return {url:location.pathname, txt:(m.innerText||'').replace(/\s+/g,' ').slice((m.innerText||'').indexOf('Settings ›'),(m.innerText||'').indexOf('Settings ›')+400),
      ctrls:[...m.querySelectorAll('button,a[href]')].filter(vis)
        .filter(e=>!(e.getAttribute('href')||'').includes('/settings/'))
        .map(b=>`${b.disabled?'(dis)':''}${((b.getAttribute('aria-label')||b.innerText)||'').replace(/\s+/g,' ').trim().slice(0,34)}`)};
  });
  // workspace switcher and company switcher
  await page.goto('https://airion-cargo.store/',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/workspace menu/i.test(x.getAttribute('aria-label')||'')); if(b)b.click();});
  await page.waitForTimeout(2000);
  out.switcher = await page.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect();return r.width>2&&r.height>2;};
    const p=[...document.querySelectorAll('[role=menu],[role=dialog],[data-radix-popper-content-wrapper]')].filter(vis);
    return p.slice(0,1).map(x=>(x.innerText||'').replace(/\s+/g,' ').slice(0,300));
  });
  return out;
};
