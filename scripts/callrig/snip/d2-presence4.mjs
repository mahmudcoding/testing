const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const net=[];
  page.on('response', async r => { const u=r.url(); if(r.request().method()==='GET') return;
    if(!/auth|presence|privacy|settings/i.test(u)) return;
    net.push(`${r.request().method()} ${u.replace(/^https?:\/\/[^/]+/,'').slice(0,44)} -> ${r.status()} ${(r.request().postData()||'').slice(0,200)}`); });
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/privacy', { waitUntil:'networkidle' });
  await page.waitForTimeout(3200);
  const labels = await page.evaluate(`(() => { const vis=(${VIS});
    const combos=[...document.querySelectorAll('main [role=combobox]')].filter(vis);
    const texts=[...document.querySelectorAll('main *')].filter(vis).filter(e=>e.children.length===0)
      .map(e=>({t:(e.innerText||'').trim(), y:e.getBoundingClientRect().y})).filter(x=>x.t&&x.t.length<60);
    return combos.map((c,i)=>{ const y=c.getBoundingClientRect().y;
      const above=texts.filter(x=>x.y<y&&x.y>y-70).sort((a,b)=>b.y-a.y);
      return { i, label: above.length?above[0].t:'(none)', value:(c.innerText||'').trim().slice(0,28) }; }); })()`);
  const idx = labels.findIndex(l => /Online status/i.test(l.label));
  if (idx < 0) return { err:'Online status combobox not found', labels };
  const c = page.locator('main [role=combobox]').nth(idx);
  await c.scrollIntoViewIfNeeded(); await c.click(); await page.waitForTimeout(1500);
  const clicked = await page.evaluate(`(() => { const vis=(${VIS});
    const w=[...document.querySelectorAll('[data-radix-popper-content-wrapper],[role=listbox]')].filter(vis)[0];
    if(!w) return 'no popper';
    const el=[...w.querySelectorAll('*')].filter(vis).filter(e=>e.children.length===0)
      .find(e=>(e.innerText||'').trim()==='Nobody');
    if(!el) return 'option Nobody not found'; el.click(); return 'clicked'; })()`);
  await page.waitForTimeout(1800);
  const valueAfterPick = await page.evaluate(`(() => { const vis=(${VIS});
    return ([...document.querySelectorAll('main [role=combobox]')].filter(vis)[${idx}].innerText||'').trim().slice(0,28); })()`);
  const saveBar = await page.evaluate(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim())
      .filter(t=>/^(Save|Discard|Save changes|Save preferences)$/i.test(t)); })()`);
  net.length=0;
  if (saveBar.length) { const s=page.locator('button').filter({hasText:/^Save/}).first();
    await s.scrollIntoViewIfNeeded(); await s.click(); await page.waitForTimeout(3500); }
  const reqAfterSave=[...net];
  await page.reload({ waitUntil:'networkidle' }); await page.waitForTimeout(3000);
  const after = await page.evaluate(async () => {
    const r=await fetch('/api/v1/auth/me',{credentials:'include'}); const j=await r.json(); const u=j.user||j;
    return (u.settings||{}).privacy; });
  const valueAfterReload = await page.evaluate(`(() => { const vis=(${VIS});
    return ([...document.querySelectorAll('main [role=combobox]')].filter(vis)[${idx}].innerText||'').trim().slice(0,28); })()`);
  return { labels, targetIndex: idx, clickResult: clicked, valueAfterPick, saveBarButtons: saveBar,
           requestsOnSave: reqAfterSave, serverPrivacyAfter: after, valueAfterReload };
};
