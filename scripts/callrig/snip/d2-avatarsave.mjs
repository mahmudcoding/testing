const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const net=[];
  page.on('response', async r => { if(r.request().method()==='GET') return; const u=r.url();
    let b=''; try{b=(await r.text()).slice(0,220);}catch{}
    net.push(`${r.request().method()} ${u.replace(/^https?:\/\/[^/]+/,'').slice(0,50)} -> ${r.status()} ${b.slice(0,150)}`); });
  let notices=[];
  const poll=setInterval(async()=>{ try{ const n=await page.evaluate(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast]')].filter(vis)
      .map(e=>(e.innerText||'').trim()).filter(Boolean); })()`); if(n.length>notices.length) notices=n; }catch{} },250);
  const save = page.locator('button:has-text("Save changes")').first();
  const found = await save.count();
  if (found) { await save.scrollIntoViewIfNeeded(); await save.click(); await page.waitForTimeout(9000); }
  clearInterval(poll);
  const out = { saveFound: found, requests: net, notices };
  await page.reload({ waitUntil:'networkidle' }); await page.waitForTimeout(3000);
  out.afterReload = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const imgs=[...main.querySelectorAll('img')].filter(vis).map(i=>(i.getAttribute('src')||'').slice(0,100));
    const btns=[...main.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim())
      .filter(t=>/avatar|image|remove|Discard|Save/i.test(t));
    return { images: imgs, avatarButtons: btns }; })()`);
  out.api = await page.evaluate(async () => {
    const j=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json(); const u=j.user||j;
    const av=Object.entries(u).filter(([k])=>/avatar|image|photo/i.test(k));
    const m=await (await fetch('/api/v1/workspaces/W4QDF1XTURESO01/members?limit=50',{credentials:'include'})).json();
    const a=(m.members||m.items||[]).find(x=>x.user_id==='U4QDALICE000001')||{};
    return { authMeAvatarFields: av, memberRowKeys: Object.keys(a),
             memberAvatar: a.avatar_url ?? a.avatar ?? '(absent from member row)' }; });
  return out;
};
