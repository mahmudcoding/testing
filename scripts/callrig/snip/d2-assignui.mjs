const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const out={};
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/roles?scope=company', { waitUntil:'networkidle' });
  await page.waitForTimeout(2500);
  out.setup = await page.evaluate(async () => {
    const CO='O4QDF1XTURESO01';
    const r=await fetch(`/api/v1/companies/${CO}/roles`,{method:'POST',credentials:'include',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ name:'D2 assign probe', permissions:[`company.${CO}.member.view`] })});
    const j=await r.json(); return { s:r.status, id:j.id };
  });
  await page.reload({ waitUntil:'networkidle' }); await page.waitForTimeout(3200);
  const net=[]; const on = async r => { if(!/role/i.test(r.url())||r.request().method()==='GET') return;
    let b=''; try{b=(await r.text()).slice(0,180);}catch{}
    net.push(`${r.request().method()} ${r.url().replace(/^https?:\/\/[^/]+/,'').slice(0,42)} -> ${r.status()} ${b.slice(0,110)}`); };
  page.on('response', on);
  // the two comboboxes in "Assign a role"
  const combos = page.locator('main [role=combobox]');
  out.comboCount = await combos.count();
  const openAndPick = async (i, text) => {
    const c = combos.nth(i); await c.scrollIntoViewIfNeeded(); await c.click(); await page.waitForTimeout(1400);
    const opts = await page.evaluate(`(() => { const vis=(${VIS});
      const w=[...document.querySelectorAll('[data-radix-popper-content-wrapper],[role=listbox]')].filter(vis)[0];
      if(!w) return []; return [...w.querySelectorAll('*')].filter(vis).map(e=>(e.innerText||'').trim())
        .filter(t=>t&&t.length<60).filter((v,j,a)=>a.indexOf(v)===j).slice(0,10); })()`);
    const ok = await page.evaluate(`(() => { const vis=(${VIS}); const T=${JSON.stringify(text)};
      const w=[...document.querySelectorAll('[data-radix-popper-content-wrapper],[role=listbox]')].filter(vis)[0];
      if(!w) return false;
      const el=[...w.querySelectorAll('*')].filter(vis).filter(e=>e.children.length===0)
        .find(e=>(e.innerText||'').trim()===T) || [...w.querySelectorAll('*')].filter(vis).find(e=>(e.innerText||'').trim()===T);
      if(!el) return false; el.click(); return true; })()`);
    await page.waitForTimeout(1200);
    return { options: opts, picked: ok };
  };
  out.member = await openAndPick(0, 'QA Carol');
  out.role   = await openAndPick(1, 'D2 assign probe');
  const btn = page.locator('main button:has-text("Assign")').first();
  out.assignButton = { count: await btn.count(), disabled: (await btn.count()) ? await btn.isDisabled() : null };
  net.length=0;
  if (out.assignButton.count && !out.assignButton.disabled) { await btn.scrollIntoViewIfNeeded(); await btn.click(); await page.waitForTimeout(4000); }
  page.off('response', on);
  out.assignRequests = net;
  out.carolRolesAfter = await page.evaluate(async () => {
    const CO='O4QDF1XTURESO01';
    const j=await (await fetch(`/api/v1/companies/${CO}/members?limit=100&offset=0`,{credentials:'include'})).json();
    const a=j.members||j.items||[]; const m=a.find(x=>x.user_id==='U4QDCAROL000001');
    return m?(m.roles||[]).map(r=>r.name):'(not found)';
  });
  return out;
};
