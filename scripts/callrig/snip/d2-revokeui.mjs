const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const out={};
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/roles?scope=company', { waitUntil:'networkidle' });
  await page.waitForTimeout(3500);
  out.revokeButtons = await page.evaluate(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('main button')].filter(vis)
      .map(b=>((b.getAttribute('aria-label')||'')+' | '+(b.innerText||'').trim()).replace(/\\s+/g,' ').slice(0,60))
      .filter(t=>/remove|revoke/i.test(t)).slice(0,8); })()`);
  const net=[]; const on = async r => { if(!/role/i.test(r.url())||r.request().method()==='GET') return;
    let b=''; try{b=(await r.text()).slice(0,160);}catch{}
    net.push(`${r.request().method()} ${r.url().replace(/^https?:\/\/[^/]+/,'').slice(0,42)} -> ${r.status()} ${b.slice(0,100)}`); };
  page.on('response', on);
  let notices=[];
  const poll=setInterval(async()=>{ try{ const n=await page.evaluate(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast]')].filter(vis)
      .map(e=>(e.innerText||'').trim()).filter(Boolean); })()`); if(n.length>notices.length) notices=n; }catch{} },250);
  const clicked = await page.evaluate(`(() => { const vis=(${VIS});
    const b=[...document.querySelectorAll('main button')].filter(vis)
      .find(x=>/Remove D2 assign probe from QA Carol/i.test((x.getAttribute('aria-label')||'')+' '+(x.innerText||'')));
    if(!b) return false; b.click(); return true; })()`);
  await page.waitForTimeout(4000);
  // a confirm dialog may appear
  for (const sel of ['[role=dialog] button:has-text("Remove")','[role=alertdialog] button:has-text("Remove")','[role=dialog] button:has-text("Revoke")']) {
    const c = page.locator(sel).last();
    if (await c.count()) { await c.click().catch(()=>{}); await page.waitForTimeout(3000); break; }
  }
  clearInterval(poll); page.off('response', on);
  out.clicked = clicked; out.requests = net; out.notices = notices;
  out.carolRoles = await page.evaluate(async () => {
    const j=await (await fetch('/api/v1/companies/O4QDF1XTURESO01/members?limit=100&offset=0',{credentials:'include'})).json();
    const a=j.members||j.items||[]; const m=a.find(x=>x.user_id==='U4QDCAROL000001');
    return m?(m.roles||[]).map(r=>r.name):'(not found)'; });
  return out;
};
