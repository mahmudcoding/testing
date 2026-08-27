import { safeClick } from './lib.mjs';
export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  const out=[];
  for (let i=0;i<3;i++){
    await page.goto(`https://airion-cargo.store/w/${WS}/settings/notifications`,{waitUntil:'domcontentloaded'});
    await page.waitForTimeout(6000);
    const read = () => page.evaluate(()=>{
      const vis=el=>{const r=el.getBoundingClientRect();return r.width>2&&r.height>2;};
      const lab=e=>{ let p=e.parentElement; for(let k=0;k<5&&p;k++,p=p.parentElement){const t=(p.innerText||'').trim(); if(t&&t.length<140)return t;} return ''; };
      return [...document.querySelectorAll('[role=switch]')].filter(vis)
        .map(e=>({on:e.getAttribute('aria-checked'), label:lab(e).replace(/\s+/g,' ').split(' ').slice(0,4).join(' ')}));
    });
    const before = await read();
    const reqs=[]; const on=r=>{try{const u=new URL(r.url()); if(r.request().method()!=='GET' && u.pathname.startsWith('/api/v1/')) reqs.push(`${r.request().method()} ${u.pathname} -> ${r.status()}`);}catch{}};
    page.on('response', on);
    const click = await safeClick(page,'[role=switch]',{index:i});
    await page.waitForTimeout(7000);
    page.off('response', on);
    const afterClick = await read();
    await page.goto(`https://airion-cargo.store/w/${WS}/settings/notifications`,{waitUntil:'domcontentloaded'});
    await page.waitForTimeout(5000);
    const afterReload = await read();
    const api = await page.evaluate(async()=>await (await fetch('/api/v1/notifications/settings',{credentials:'include'})).json());
    out.push({i, label:before[i].label, was:before[i].on, clicked:click.ok,
      onScreenAfterClick:afterClick[i].on, afterReload:afterReload[i].on, reqs, api});
    // put it back if it stuck
    if (afterReload[i].on !== before[i].on) { await safeClick(page,'[role=switch]',{index:i}); await page.waitForTimeout(5000); }
  }
  return out;
};
