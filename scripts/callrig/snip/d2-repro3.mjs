export default async ({ page }) => {
  const WS='W4QDF1XTURESO01', CO='O4QDF1XTURESO01'; const out={};
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/account`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(900); await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(4000);
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/roles?scope=company`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  out.screen = await page.evaluate(() => {
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const main=document.querySelector('main');
    const all=(main.innerText||'').replace(/\s+/g,' ');
    const i=all.indexOf('Company roles Workspace roles');
    const inter=[...main.querySelectorAll('button,input,select')].filter(vis).filter(e=>!e.closest('nav,aside'))
      .map(e=>(e.getAttribute('aria-label')||e.innerText||'').trim().replace(/\s+/g,' ')).filter(Boolean);
    return { text:(i>=0?all.slice(i):all).slice(0,190), contentControls:inter.length, sample:inter.slice(0,5) };
  });
  out.api = await page.evaluate(async (CO) => {
    const j=async(u,m,b)=>{const r=await fetch(u,{method:m||'GET',credentials:'include',
      headers:b?{'content-type':'application/json'}:{},body:b?JSON.stringify(b):undefined});
      return {s:r.status,t:(await r.text()).slice(0,120)};};
    const read=await j(`/api/v1/companies/${CO}/roles`);
    const made=await j(`/api/v1/companies/${CO}/roles`,'POST',{name:'QA D ReproProbe',permissions:[`company.${CO}.member.view`]});
    let id=null; try{id=JSON.parse(made.t)?.id;}catch{}
    const del=id? await j(`/api/v1/companies/roles/${id}`,'DELETE') : null;
    return { readRoles:read, createRole:{s:made.s}, cleanup:del&&del.s };
  }, CO);
  return out;
};
