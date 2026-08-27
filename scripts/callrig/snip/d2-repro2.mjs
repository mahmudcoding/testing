export default async ({ page }) => {
  const WS='W4QDF1XTURESO01', CO='O4QDF1XTURESO01'; const out={};
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/account`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(1000);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  out.adminGroup = await page.evaluate(() => {
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    return [...document.querySelectorAll('a[href*="/settings/"]')].filter(vis)
      .map(a=>a.getAttribute('href').split('/settings/')[1])
      .filter(h=>h.startsWith('admin/')||h.startsWith('roles'));
  });
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/audit-log`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  out.page = await page.evaluate(() => {
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const main=document.querySelector('main')||document.body;
    const all=(main.innerText||'').replace(/\s+/g,' '); const i=all.indexOf('Settings ›');
    const c=(i>=0?all.slice(i):all);
    const inter=[...main.querySelectorAll('button,input,select,[role=tab]')].filter(vis)
      .filter(e=>!e.closest('nav,aside'))
      .map(e=>(e.getAttribute('aria-label')||e.innerText||'').trim().replace(/\s+/g,' ')).filter(Boolean);
    return { text:c.slice(0,190), contentControls:inter.length, sample:inter.slice(0,5) };
  });
  out.api = await page.evaluate(async ({CO,WS}) => {
    const j=async u=>{const r=await fetch(u,{credentials:'include'}); const t=await r.text();
      let n=null; try{const p=JSON.parse(t); n=(p.entries||p.items||p.data||[]).length;}catch{}
      return {s:r.status, entries:n};};
    return { company: await j(`/api/v1/companies/${CO}/admin/audit-log?limit=5`),
             workspace: await j(`/api/v1/workspaces/${WS}/admin/audit-log?limit=5`) };
  }, {CO,WS});
  return out;
};
