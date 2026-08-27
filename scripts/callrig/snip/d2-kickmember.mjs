const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/admin/members', { waitUntil:'networkidle' });
  await page.waitForTimeout(3200);
  const out={};
  out.before = await page.evaluate(async () => {
    const j=await (await fetch('/api/v1/companies/O4QDF1XTURESO01/members?limit=100&offset=0',{credentials:'include'})).json();
    const a=j.members||j.items||[]; return { count:a.length, hasOutsider:a.some(m=>m.user_id==='U4QDOUTSIDER001') }; });
  const net=[]; const on=async r=>{ if(!/kick/i.test(r.url())) return; let b=''; try{b=(await r.text()).slice(0,140);}catch{}
    net.push(`${r.request().method()} ${r.url().replace(/^https?:\/\/[^/]+/,'').slice(0,40)} -> ${r.status()} ${b.slice(0,90)}`); };
  page.on('response', on);
  let notices=[];
  const poll=setInterval(async()=>{ try{ const n=await page.evaluate(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast]')].filter(vis)
      .map(e=>(e.innerText||'').trim()).filter(Boolean); })()`); if(n.length>notices.length) notices=n; }catch{} },250);
  const btn = page.locator('button[aria-label="Remove QA Outsider from the company"]').first();
  out.buttonFound = await btn.count();
  if (out.buttonFound) { await btn.scrollIntoViewIfNeeded(); await btn.click(); await page.waitForTimeout(2200);
    for (const sel of ['[role=dialog] button:has-text("Remove member")','[role=alertdialog] button:has-text("Remove member")']) {
      const c=page.locator(sel).last(); if (await c.count()) { await c.click().catch(()=>{}); await page.waitForTimeout(4000); break; } } }
  clearInterval(poll); page.off('response', on);
  out.requests=net; out.notices=notices;
  out.after = await page.evaluate(async () => {
    const j=await (await fetch('/api/v1/companies/O4QDF1XTURESO01/members?limit=100&offset=0',{credentials:'include'})).json();
    const a=j.members||j.items||[]; return { count:a.length, hasOutsider:a.some(m=>m.user_id==='U4QDOUTSIDER001') }; });
  return out;
};
