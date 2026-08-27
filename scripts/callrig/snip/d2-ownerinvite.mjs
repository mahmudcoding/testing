const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const net=[];
  page.on('response', async r => { const u=r.url(); if(!/invite/i.test(u)||r.request().method()==='GET') return;
    let b=''; try{b=(await r.text()).slice(0,160);}catch{}
    net.push(`${r.request().method()} ${u.replace(/^https?:\/\/[^/]+/,'').slice(0,44)} -> ${r.status()}`); });
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/admin/invites', { waitUntil:'networkidle' });
  await page.waitForTimeout(3200);
  const out={};
  out.controls = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    return [...main.querySelectorAll('button,input,select,[role=combobox]')].filter(vis)
      .filter(e=>(e.getAttribute('placeholder')||'')!=='Filter settings')
      .map(e=>({ l:(e.getAttribute('aria-label')||e.innerText||e.getAttribute('placeholder')||'').trim().slice(0,32), dis:e.disabled===true })); })()`);
  // pick a role, then create the link — the owner path through the UI
  const combo = page.locator('main [role=combobox]').first();
  if (await combo.count()) { await combo.scrollIntoViewIfNeeded(); await combo.click(); await page.waitForTimeout(1400);
    await page.evaluate(`(() => { const vis=(${VIS});
      const w=[...document.querySelectorAll('[data-radix-popper-content-wrapper],[role=listbox]')].filter(vis)[0];
      if(!w) return; const el=[...w.querySelectorAll('*')].filter(vis).filter(e=>e.children.length===0)
        .find(e=>(e.innerText||'').trim()==='Member'); if(el) el.click(); })()`);
    await page.waitForTimeout(1200); }
  const btn = page.locator('button:has-text("Create invite link")').first();
  out.createButton = { found: await btn.count(), disabled: (await btn.count()) ? await btn.isDisabled() : null };
  net.length=0;
  if (out.createButton.found && !out.createButton.disabled) { await btn.scrollIntoViewIfNeeded(); await btn.click(); await page.waitForTimeout(4000); }
  out.requests = net;
  out.linkShown = await page.evaluate(`(() => { const t=(document.querySelector('main')||document.body).innerText;
    return /invite\\?token=/.test(t); })()`);
  // revoke whatever we just made
  out.cleanup = await page.evaluate(async () => {
    const W='W4QDF1XTURESO01';
    const j=await (await fetch(`/api/v1/workspaces/${W}/invites`,{credentials:'include'})).json();
    const a=(j.invites||j.items||[]).filter(i=>i.status==='pending');
    const r=[]; for (const i of a) r.push((await fetch(`/api/v1/workspaces/invites/${i.id}/revoke`,{method:'POST',credentials:'include'})).status);
    return r; });
  return out;
};
