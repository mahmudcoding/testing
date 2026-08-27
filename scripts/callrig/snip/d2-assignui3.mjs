const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const out={};
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/roles?scope=company', { waitUntil:'networkidle' });
  await page.waitForTimeout(3500);
  const combos = page.locator('main [role=combobox]');
  const pick = async (i, text) => {
    const c = combos.nth(i); await c.scrollIntoViewIfNeeded(); await c.click(); await page.waitForTimeout(1500);
    const r = await page.evaluate(`(() => { const vis=(${VIS}); const T=${JSON.stringify(text)};
      const w=[...document.querySelectorAll('[data-radix-popper-content-wrapper],[role=listbox]')].filter(vis)[0];
      if(!w) return 'no popper';
      const leaf=[...w.querySelectorAll('*')].filter(vis).filter(e=>e.children.length===0).find(e=>(e.innerText||'').trim()===T);
      if(!leaf) return 'not found'; leaf.click(); return 'ok'; })()`);
    await page.waitForTimeout(1400); return r;
  };
  await pick(0, 'QA Carol');
  await pick(1, 'D2 assign probe');
  out.selections = await page.evaluate(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('main [role=combobox]')].filter(vis).map(e=>(e.innerText||'').trim().slice(0,30)); })()`);
  const net=[]; const on = async r => { if(!/role/i.test(r.url())||r.request().method()==='GET') return;
    let b=''; try{b=(await r.text()).slice(0,180);}catch{}
    net.push(`${r.request().method()} ${r.url().replace(/^https?:\/\/[^/]+/,'').slice(0,42)} -> ${r.status()} ${b.slice(0,110)}`); };
  page.on('response', on);
  let notices=[];
  const poll=setInterval(async()=>{ try{ const n=await page.evaluate(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast]')].filter(vis)
      .map(e=>(e.innerText||'').trim()).filter(Boolean); })()`); if(n.length>notices.length) notices=n; }catch{} },250);
  const btn = page.locator('main button').filter({ hasText: /^Assign role$/ }).first();
  out.buttonFound = await btn.count();
  if (out.buttonFound) { await btn.scrollIntoViewIfNeeded(); await btn.click(); await page.waitForTimeout(4500); }
  clearInterval(poll); page.off('response', on);
  out.requests = net; out.notices = notices;
  out.carolRoles = await page.evaluate(async () => {
    const j=await (await fetch('/api/v1/companies/O4QDF1XTURESO01/members?limit=100&offset=0',{credentials:'include'})).json();
    const a=j.members||j.items||[]; const m=a.find(x=>x.user_id==='U4QDCAROL000001');
    return m?(m.roles||[]).map(r=>r.name):'(not found)'; });
  return out;
};
