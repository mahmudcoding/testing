import { watchNotices, safeClick } from './lib.mjs';
export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/notifications`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  const read = () => page.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect();return r.width>2&&r.height>2;};
    const lab=e=>{ if(e.id){const l=document.querySelector(`label[for="${CSS.escape(e.id)}"]`); if(l)return l.innerText.trim();}
      const l=e.closest('label'); if(l)return l.innerText.trim();
      let p=e.parentElement; for(let k=0;k<5&&p;k++,p=p.parentElement){const t=(p.innerText||'').trim(); if(t&&t.length<140)return t;} return ''; };
    return [...document.querySelectorAll('[role=switch]')].filter(vis)
      .map(e=>({on:e.getAttribute('aria-checked'), label:lab(e).replace(/\s+/g,' ').slice(0,45)}));
  });
  const out={before: await read()};
  const reqs=[]; const on=r=>{try{const u=new URL(r.url()); if(r.request().method()!=='GET') reqs.push(`${r.request().method()} ${u.pathname} -> ${r.status()}`);}catch{}};
  const failed=[]; page.on('requestfailed', r=>{try{failed.push(r.method()+' '+new URL(r.url()).pathname);}catch{}});
  page.on('response', on);
  out.notices = await watchNotices(page,{ms:22000, trigger: async()=>{
    const sw = page.locator('[role=switch]').first();      // In-app notifications is the first
    out.click = await safeClick(page,'[role=switch]',{index:0});
  }});
  page.off('response', on);
  out.reqs = reqs.filter(r=>!/rum/.test(r)); out.failed = failed;
  out.afterClick = await read();
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/notifications`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  out.afterReload = await read();
  out.api = await page.evaluate(async()=>await (await fetch('/api/v1/notifications/settings',{credentials:'include'})).json());
  return out;
};
