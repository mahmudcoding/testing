const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const out={};
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/roles?scope=company', { waitUntil:'networkidle' });
  await page.waitForTimeout(3500);
  const combos = page.locator('main [role=combobox]');
  const read = async () => page.evaluate(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('main [role=combobox]')].filter(vis)
      .map(e=>({ text:(e.innerText||'').trim().replace(/\\n/g,' ').slice(0,40),
                 expanded:e.getAttribute('aria-expanded'), val:e.getAttribute('data-value')||'' })); })()`);
  out.combosBefore = await read();
  const pick = async (i, text) => {
    const c = combos.nth(i); await c.scrollIntoViewIfNeeded(); await c.click(); await page.waitForTimeout(1500);
    const ok = await page.evaluate(`(() => { const vis=(${VIS}); const T=${JSON.stringify(text)};
      const w=[...document.querySelectorAll('[data-radix-popper-content-wrapper],[role=listbox]')].filter(vis)[0];
      if(!w) return 'no popper';
      const leaf=[...w.querySelectorAll('*')].filter(vis).filter(e=>e.children.length===0)
        .find(e=>(e.innerText||'').trim()===T);
      if(!leaf) return 'option not found';
      leaf.click(); return 'clicked'; })()`);
    await page.waitForTimeout(1500);
    return ok;
  };
  out.pickMember = await pick(0, 'QA Carol');
  out.combosAfterMember = await read();
  out.pickRole = await pick(1, 'D2 assign probe');
  out.combosAfterRole = await read();
  // identify EVERY button that could be the assign action
  out.candidateButtons = await page.evaluate(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('main button')].filter(vis)
      .map((b,i)=>({ i, text:(b.innerText||'').trim().replace(/\\n/g,' ').slice(0,30),
                     aria:(b.getAttribute('aria-label')||'').slice(0,30), dis:b.disabled===true }))
      .filter(x=>/assign/i.test(x.text+' '+x.aria)); })()`);
  const net=[]; const on = async r => { if(!/role/i.test(r.url())||r.request().method()==='GET') return;
    let b=''; try{b=(await r.text()).slice(0,180);}catch{}
    net.push(`${r.request().method()} ${r.url().replace(/^https?:\/\/[^/]+/,'').slice(0,42)} -> ${r.status()} ${b.slice(0,110)}`); };
  page.on('response', on);
  let notices=[];
  const poll=setInterval(async()=>{ try{ const n=await page.evaluate(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast]')].filter(vis)
      .map(e=>(e.innerText||'').trim()).filter(Boolean); })()`); if(n.length>notices.length) notices=n; }catch{} },250);
  if (out.candidateButtons.length) {
    const idx = out.candidateButtons[0].i;
    await page.evaluate(`(() => { const vis=(${VIS});
      [...document.querySelectorAll('main button')].filter(vis)[${idx}].click(); })()`);
    await page.waitForTimeout(4500);
  }
  clearInterval(poll); page.off('response', on);
  out.requests = net; out.notices = notices;
  out.carolRoles = await page.evaluate(async () => {
    const j=await (await fetch('/api/v1/companies/O4QDF1XTURESO01/members?limit=100&offset=0',{credentials:'include'})).json();
    const a=j.members||j.items||[]; const m=a.find(x=>x.user_id==='U4QDCAROL000001');
    return m?(m.roles||[]).map(r=>r.name):'(not found)'; });
  return out;
};
