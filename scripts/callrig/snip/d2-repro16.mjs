export default async ({ page }) => {
  const WS='W4QDF1XTURESO01'; const out={};
  const get=()=>page.evaluate(async()=>{const r=await fetch('/api/v1/notifications/settings',{credentials:'include'});
    return {s:r.status, b:(await r.text()).slice(0,240)};});
  out.initial = await get();
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/notifications`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const switches = async () => page.evaluate(() => {
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const main=document.querySelector('main');
    return [...main.querySelectorAll('[role=switch]')].filter(vis).map((s,i)=>{
      let p=s.closest('label')||s.parentElement, lab='';
      for(let k=0;k<4&&p;k++,p=p.parentElement){const t=(p.innerText||'').trim(); if(t&&t.length<90){lab=t;break;}}
      return {i, label:lab.replace(/\s+/g,' ').slice(0,46), on:s.getAttribute('aria-checked')};
    });
  });
  out.switchesBefore = await switches();
  // step 1: turn off In-app notifications
  const idx = out.switchesBefore.findIndex(s=>/In-app notifications/i.test(s.label));
  out.inAppIndex = idx;
  if (idx<0) return out;
  const els = await page.$$('main [role=switch]');
  await els[idx].click().catch(()=>{});
  await page.waitForTimeout(1200);
  const save = await page.$('main button:has-text("Save preferences")');
  out.saveFound = !!save;
  if (save) { await save.click().catch(()=>{}); await page.waitForTimeout(3000); }
  out.afterSave = await page.evaluate(() => {
    const t=(document.body.innerText||'').replace(/\s+/g,' ');
    const msgs=[...t.matchAll(/(In-app notifications cannot[^.]*\.[^"]{0,60}|Keep at least one[^.]*\.)/g)].map(m=>m[0].trim());
    return { messages:[...new Set(msgs)].slice(0,3) };
  });
  // step 2: what delivery-method controls exist on the page?
  out.switchesOnPage = (await switches()).map(s=>s.label);
  out.serverAfterStep1 = await get();
  return out;
};
