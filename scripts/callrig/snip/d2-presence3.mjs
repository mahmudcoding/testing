const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/privacy', { waitUntil:'networkidle' });
  await page.waitForTimeout(3200);
  // label each combobox by the nearest preceding text above it
  const labelled = await page.evaluate(`(() => { const vis=(${VIS});
    const combos=[...document.querySelectorAll('main [role=combobox]')].filter(vis);
    const texts=[...document.querySelectorAll('main *')].filter(vis).filter(e=>e.children.length===0)
      .map(e=>({ t:(e.innerText||'').trim(), y:e.getBoundingClientRect().y })).filter(x=>x.t && x.t.length<60);
    return combos.map(c=>{ const y=c.getBoundingClientRect().y;
      const above=texts.filter(x=>x.y<y && x.y>y-70).sort((a,b)=>b.y-a.y);
      return { value:(c.innerText||'').trim().slice(0,30), labelAbove: above.length?above[0].t:'(none)',
               y:Math.round(y) }; }); })()`);
  const net=[];
  page.on('response', async r => { const u=r.url(); if(!/auth\/me|presence/i.test(u)||r.request().method()==='GET') return;
    net.push(`${r.request().method()} ${u.replace(/^https?:\/\/[^/]+/,'').slice(0,44)} -> ${r.status()} ${(r.request().postData()||'').slice(0,180)}`); });
  // change the FIRST combobox (online status) to the most restrictive option
  const c0 = page.locator('main [role=combobox]').first();
  await c0.scrollIntoViewIfNeeded(); await c0.click(); await page.waitForTimeout(1400);
  const options = await page.evaluate(`(() => { const vis=(${VIS});
    const w=[...document.querySelectorAll('[data-radix-popper-content-wrapper],[role=listbox]')].filter(vis)[0];
    if(!w) return []; return [...w.querySelectorAll('*')].filter(vis).filter(e=>e.children.length===0)
      .map(e=>(e.innerText||'').trim()).filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i); })()`);
  const target = options.find(o=>/nobody|no one|only me|private/i.test(o)) || options[options.length-1];
  const picked = await page.evaluate(`(() => { const vis=(${VIS}); const T=${JSON.stringify('')};
    return true; })()`);
  const clickOpt = await page.evaluate(`((T) => { const vis=(${VIS});
    const w=[...document.querySelectorAll('[data-radix-popper-content-wrapper],[role=listbox]')].filter(vis)[0];
    if(!w) return 'no popper';
    const el=[...w.querySelectorAll('*')].filter(vis).filter(e=>e.children.length===0).find(e=>(e.innerText||'').trim()===T);
    if(!el) return 'not found'; el.click(); return 'clicked'; })`, target);
  await page.waitForTimeout(1500);
  // save if a save bar appeared
  const save = page.locator('button:has-text("Save")').first();
  let savedVia=null;
  if (await save.count()) { savedVia=(await save.innerText()).trim(); await save.scrollIntoViewIfNeeded(); await save.click(); await page.waitForTimeout(3500); }
  await page.reload({ waitUntil:'networkidle' }); await page.waitForTimeout(2800);
  const after = await page.evaluate(async () => {
    const r=await fetch('/api/v1/auth/me',{credentials:'include'}); const j=await r.json(); const u=j.user||j;
    return { privacy:(u.settings||{}).privacy, presence:u.presence }; });
  const combosAfter = await page.evaluate(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('main [role=combobox]')].filter(vis).map(c=>(c.innerText||'').trim().slice(0,30)); })()`);
  return { combosLabelled: labelled, optionsOffered: options, pickedOption: target, clickResult: clickOpt,
           savedVia, requests: net, serverAfter: after, combosAfterReload: combosAfter };
};
