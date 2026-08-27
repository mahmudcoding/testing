// Read the CURRENT page without navigating, then try the same refetch the page would make.
export default async ({page}) => {
  return await page.evaluate(async ()=>{
    const vis=el=>{const r=el.getBoundingClientRect(); return r.width>2&&r.height>2;};
    const m=document.querySelector('main')||document.body;
    const t=(m.innerText||'').replace(/\s+/g,' ');
    const i=t.indexOf('Settings ›');
    const refetch=await fetch('/api/v1/workspaces/W4QDF1XTURESO01/admin/audit-log?limit=5',{credentials:'include'});
    const roles=await (await fetch('/api/v1/users/me/roles',{credentials:'include'})).text();
    return {url:location.pathname,
      stillShowingTable: !!m.querySelector('tbody tr'),
      rowsStillRendered: m.querySelectorAll('tbody tr').length,
      screen: t.slice(i, i+220),
      controls:[...m.querySelectorAll('button')].filter(vis).map(b=>b.innerText.trim()).filter(Boolean).slice(0,6),
      refetchStatus: refetch.status,
      stillHasProbeRole: /QA D2 revoke probe/.test(roles)};
  });
};
