export default async ({page}) => {
  const out={};
  const ws = process.env.QA_WS;
  for (const path of [`/w/${ws}/settings/company`, `/w/${ws}/settings/admin/company`, `/w/${ws}/settings/admin/workspaces`]) {
    await page.goto('https://airion-cargo.store'+path,{waitUntil:'domcontentloaded'});
    await page.waitForTimeout(6000);
    out[path] = await page.evaluate(()=>{
      const vis=el=>{const r=el.getBoundingClientRect();return r.width>2&&r.height>2;};
      const m=document.querySelector('main')||document.body;
      const t=(m.innerText||'').replace(/\s+/g,' ');
      const i=t.indexOf('Settings ›');
      return {url:location.pathname, txt: i>=0? t.slice(i,i+340) : t.slice(0,340),
        ctrls:[...m.querySelectorAll('button,a[href]')].filter(vis)
          .filter(e=>!/^\/w\/[^/]+\/settings\//.test(e.getAttribute('href')||''))
          .map(b=>`${b.disabled?'(dis)':''}${((b.getAttribute('aria-label')||b.innerText)||'').replace(/\s+/g,' ').trim().slice(0,32)}`).slice(0,12)};
    });
  }
  return out;
};
