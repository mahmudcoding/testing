export default async ({ page }) => {
  const WS='W4QDF1XTURESO01'; const out={};
  await page.goto(`https://airion-cargo.store/w/${WS}/c/C4QDGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4200);
  const btn = await page.$('button[aria-label="Open workspace menu"]');
  out.switcherFound = !!btn;
  if (btn) { await btn.click().catch(()=>{}); await page.waitForTimeout(2000); }
  out.menu = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const items=[...document.querySelectorAll('[role=menuitem],[role=option],button,a')].filter(vis)
      .map(e=>(e.getAttribute('aria-label')||e.innerText||'').trim().replace(/\s+/g,' ')).filter(Boolean);
    return items.filter(x=>/workspace|Workspace|QA /.test(x)).slice(0,12);
  });
  out.apiWorkspaces = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/users/me/workspaces',{credentials:'include'});
    const p=await r.json(); const a=p.workspaces||p.data||p;
    return (Array.isArray(a)?a:[]).map(w=>({name:w.name, type:w.type}));
  });
  return out;
};
