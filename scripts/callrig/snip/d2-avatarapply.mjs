const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const net=[];
  page.on('response', async r => { if(r.request().method()==='GET') return; const u=r.url();
    let b=''; try{b=(await r.text()).slice(0,220);}catch{}
    net.push(`${r.request().method()} ${u.replace(/^https?:\/\/[^/]+/,'').slice(0,48)} -> ${r.status()} ${b.slice(0,140)}`); });
  const out={ dialogNow: await page.evaluate(`(() => { const vis=(${VIS});
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
    if(!d) return '(no dialog)';
    return { text:(d.innerText||'').replace(/\\n+/g,' | ').slice(0,180),
      controls:[...d.querySelectorAll('button,input')].filter(vis)
        .map(e=>({t:(e.innerText||e.getAttribute('aria-label')||e.type||'').trim().slice(0,20), dis:e.disabled===true})) }; })()`) };
  let notices=[];
  const poll=setInterval(async()=>{ try{ const n=await page.evaluate(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast]')].filter(vis)
      .map(e=>(e.innerText||'').trim()).filter(Boolean); })()`); if(n.length>notices.length) notices=n; }catch{} },250);
  net.length=0;
  const apply = page.locator('[role=dialog] button:has-text("Apply")').first();
  out.applyFound = await apply.count();
  if (out.applyFound) { await apply.click().catch(()=>{}); await page.waitForTimeout(8000); }
  clearInterval(poll);
  out.requests=net; out.notices=notices;
  out.after = await page.evaluate(async () => {
    const j=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json(); const u=j.user||j;
    const av=Object.entries(u).filter(([k])=>/avatar|image|photo/i.test(k));
    return { avatarFields: av, hasImgInHeader: !!document.querySelector('main img') }; });
  out.controlsAfter = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    return [...main.querySelectorAll('button')].filter(vis)
      .filter(b=>/image|avatar|remove|delete|photo/i.test((b.innerText||'')+(b.getAttribute('aria-label')||'')))
      .map(b=>(b.innerText||b.getAttribute('aria-label')||'').trim().slice(0,26)); })()`);
  return out;
};
