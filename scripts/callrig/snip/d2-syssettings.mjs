export default async ({ page }) => {
  const WS='W4QDF1XTURESO01'; const out={};
  out.me = await page.evaluate(async()=>{const r=await fetch('/api/v1/auth/me',{credentials:'include'});
    const p=await r.json(); return {email:p.email, super:p.is_super_admin};});
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/system-settings`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4200);
  out.page = await page.evaluate(() => {
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const main=document.querySelector('main');
    const t=(main.innerText||'').replace(/\s+/g,' ');
    const i=t.indexOf('Settings ›');
    const inter=[...main.querySelectorAll('button,input,select')].filter(vis).filter(e=>!e.closest('nav,aside'));
    return { url:location.pathname, text:(i>=0?t.slice(i):t).slice(0,200),
      contentControls:inter.length,
      navHasIt: !!document.querySelector('a[href*="system-settings"]'),
      mentionsReindex:/reindex|re-index/i.test(t) };
  });
  out.api = await page.evaluate(async()=>{
    const j=async u=>{const r=await fetch(u,{credentials:'include'});return r.status;};
    return { systemSettings: await j('/api/v1/admin/system-settings'),
             reindex: await j('/api/v1/admin/search/reindex') };
  });
  return out;
};
