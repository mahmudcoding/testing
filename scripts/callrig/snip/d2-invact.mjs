const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const net=[];
  page.on('response', async r => { const u=r.url(); if(!/invite/i.test(u)||r.request().method()==='GET') return;
    let b=''; try{b=(await r.text()).slice(0,200);}catch{}
    net.push(`${r.request().method()} ${u.replace(/^https?:\/\/[^/]+/,'').slice(0,50)} -> ${r.status()} ${b.slice(0,130)}`); });
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/admin/invites', { waitUntil:'networkidle' });
  await page.waitForTimeout(3500);
  const out={};
  out.permissions = await page.evaluate(async () => {
    const j=await (await fetch('/api/v1/workspaces/W4QDF1XTURESO01/members?limit=50',{credentials:'include'})).json();
    const a=j.members||j.items||[]; const m=a.find(x=>x.user_id==='U4QDALICE000001');
    return m?(m.roles||[]).flatMap(r=>r.permissions||[]):[]; });
  let notices=[];
  const poll=setInterval(async()=>{ try{ const n=await page.evaluate(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast]')].filter(vis)
      .map(e=>(e.innerText||'').trim()).filter(Boolean); })()`); if(n.length>notices.length) notices=n; }catch{} },250);
  net.length=0;
  const rev = page.locator('button:has-text("Revoke invite")').first();
  out.revokeFound = await rev.count();
  out.revokeDisabled = out.revokeFound ? await rev.isDisabled() : null;
  if (out.revokeFound && !out.revokeDisabled) { await rev.scrollIntoViewIfNeeded(); await rev.click(); await page.waitForTimeout(4000); }
  clearInterval(poll);
  out.requests = net; out.notices = notices;
  out.invitesNow = await page.evaluate(async () => {
    const j=await (await fetch('/api/v1/workspaces/W4QDF1XTURESO01/invites',{credentials:'include'})).json();
    const a=j.invites||j.items||[]; return { total:a.length, pending:a.filter(i=>i.status==='pending').length }; });
  return out;
};
