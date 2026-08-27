export default async ({ page }) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/privacy`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  const out={};
  out.api = await page.evaluate(async()=>{const r=await fetch('/api/v1/users/me/presence-settings',{credentials:'include'});return {s:r.status,t:(await r.text()).slice(0,300)};});
  // find the combobox whose label/section mentions direct messages
  const info = await page.evaluate(() => {
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const main=document.querySelector('main')||document.body;
    const cbs=[...main.querySelectorAll('[role=combobox]')].filter(vis);
    return cbs.map((c,i)=>{ let p=c.parentElement, ctx='';
      for(let k=0;k<5&&p;k++,p=p.parentElement){const t=(p.innerText||'').trim(); if(t&&t.length<160){ctx=t;break;}}
      return {i, text:(c.innerText||c.value||'').trim().slice(0,30), ctx:ctx.replace(/\s+/g,' ').slice(0,120)}; });
  });
  out.comboboxes = info;
  const idx = info.findIndex(c=>/direct message|DM|message you/i.test(c.ctx));
  out.dmIndex = idx;
  if (idx>=0) {
    const cb = (await page.$$('[role=combobox]'))[idx];
    await cb.click().catch(()=>{});
    await page.waitForTimeout(1500);
    out.options = await page.evaluate(()=>{
      const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
      return [...document.querySelectorAll('[role=option],[role=menuitem]')].filter(vis).map(o=>(o.innerText||'').trim().replace(/\s+/g,' ').slice(0,40));
    });
  }
  return out;
};
