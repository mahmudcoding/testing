export default async ({ page }) => {
  const WS='W4QDF1XTURESO01'; const out={};
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/account`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(900); await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(3500);
  out.navHasInvites = await page.evaluate(()=>!!document.querySelector('a[href$="/settings/admin/invites"]'));
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/invites`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  out.page = await page.evaluate(() => {
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const main=document.querySelector('main');
    const all=(main.innerText||'').replace(/\s+/g,' '); const i=all.indexOf('Settings ›');
    const ctl=[...main.querySelectorAll('button,input,select,[role=switch],[role=combobox],[role=checkbox]')]
      .filter(vis).filter(e=>!e.closest('nav,aside'));
    const dis=e=>e.disabled===true||e.getAttribute('aria-disabled')==='true';
    return { text:(i>=0?all.slice(i):all).slice(0,200),
      total: ctl.length, disabled: ctl.filter(dis).length,
      items: ctl.map(e=>({l:(e.getAttribute('aria-label')||e.innerText||e.placeholder||'').trim().replace(/\s+/g,' ').slice(0,34), off:dis(e)})).slice(0,12) };
  });
  out.api = await page.evaluate(async (WS) => {
    const r=await fetch('/api/v1/workspaces/invites',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'}, body:JSON.stringify({workspace_id:WS,max_uses:1,role_ids:[]})});
    const t=await r.text(); let id=null; try{id=JSON.parse(t)?.id;}catch{}
    if(id) await fetch(`/api/v1/workspaces/invites/${id}/revoke`,{method:'POST',credentials:'include'});
    return {createStatus:r.status, revokedAgain: !!id};
  }, WS);
  return out;
};
