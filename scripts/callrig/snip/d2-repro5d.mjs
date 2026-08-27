export default async ({ page }) => {
  const WS='W4QDF1XTURESO01'; const out={};
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/privacy`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  // combobox 1 = Online status (0 = Profile visibility, 2 = Last seen)
  const cbs = await page.$$('main [role=combobox]');
  out.comboCount = cbs.length;
  await cbs[1].click().catch(()=>{});
  await page.waitForTimeout(1600);
  out.options = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    return [...document.querySelectorAll('[role=option]')].filter(vis).map(o=>(o.innerText||'').trim());
  });
  const picked = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const o=[...document.querySelectorAll('[role=option]')].filter(vis).find(x=>(x.innerText||'').trim()==='Nobody');
    if(!o) return false; o.click(); return true;
  });
  out.picked = picked;
  await page.waitForTimeout(2500);
  out.afterPick = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const main=document.querySelector('main');
    return { combos:[...main.querySelectorAll('[role=combobox]')].filter(vis).map(c=>(c.innerText||'').trim()),
      switches:[...main.querySelectorAll('[role=switch]')].filter(vis).map(s=>s.getAttribute('aria-checked')) };
  });
  out.stored = await page.evaluate(async()=>{
    const me=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const ps=await (await fetch('/api/v1/users/me/presence-settings',{credentials:'include'})).json();
    return { online_visibility: me.settings?.online_visibility, presence: ps };
  });
  return out;
};
