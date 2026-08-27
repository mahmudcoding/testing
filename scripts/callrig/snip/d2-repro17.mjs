export default async ({ page }) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/sessions`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const api = await page.evaluate(async()=>{const r=await fetch('/api/v1/users/me/sessions',{credentials:'include'});
    const t=await r.text(); let n=null; try{const p=JSON.parse(t); n=(p.sessions||p.data||[]).length;}catch{}
    return {s:r.status, count:n};});
  const ui = await page.evaluate(() => {
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const main=document.querySelector('main')||document.body;
    const all=(main.innerText||'').replace(/\s+/g,' ');
    const i=all.indexOf('Settings ›');
    // enumerate everything interactive in the content area, not just buttons
    const inter=[...main.querySelectorAll('button,a,input,select,[role=button],[role=switch],[role=menuitem]')]
      .filter(vis).map(e=>({tag:e.tagName.toLowerCase(), role:e.getAttribute('role')||'',
        label:(e.getAttribute('aria-label')||e.innerText||'').trim().replace(/\s+/g,' ').slice(0,40)}));
    return { text:(i>=0?all.slice(i):all).slice(0,240), interactive:inter, count:inter.length };
  });
  return { api, ...ui };
};
