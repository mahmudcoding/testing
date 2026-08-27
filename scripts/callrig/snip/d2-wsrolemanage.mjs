export default async ({ page }) => {
  const WS='W4QDF1XTURESO01'; const out={};
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/account`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(900); await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(3500);
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/roles?scope=workspace`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4200);
  out.tab = await page.evaluate(() => {
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const main=document.querySelector('main');
    const all=(main.innerText||'').replace(/\s+/g,' ');
    const i=all.indexOf('Company roles Workspace roles');
    const c=(i>=0?all.slice(i):all);
    const inter=[...main.querySelectorAll('button,input,select')].filter(vis).filter(e=>!e.closest('nav,aside'))
      .map(e=>(e.getAttribute('aria-label')||e.innerText||'').trim().replace(/\s+/g,' ')).filter(Boolean);
    return { text:c.slice(0,260), contentControls:inter.length, sample:inter.slice(0,6),
      rows:[...main.querySelectorAll('[role=row],tbody tr')].filter(vis).length };
  });
  out.api = await page.evaluate(async (WS) => {
    const j=async(u,m,b)=>{const r=await fetch(u,{method:m||'GET',credentials:'include',
      headers:b?{'content-type':'application/json'}:{},body:b?JSON.stringify(b):undefined});
      return {s:r.status,t:(await r.text()).slice(0,130)};};
    const read=await j(`/api/v1/workspaces/${WS}/roles`);
    const made=await j(`/api/v1/workspaces/${WS}/roles`,'POST',{name:'QA D WsManageProbe',permissions:[`workspace.${WS}.channel.create`]});
    let id=null; try{id=JSON.parse(made.t)?.id;}catch{}
    return { readRoles:read.s, createRole:made.s, createdId:id };
  }, WS);
  return out;
};
