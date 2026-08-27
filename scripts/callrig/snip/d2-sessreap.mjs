const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ browser }) => {
  const W='W4QDF1XTURESO01';
  const out=[];
  for (const email of (process.env.D2_EMAILS||'').split(',').filter(Boolean)) {
    const ctx = await browser.newContext();
    const p = await ctx.newPage();
    try {
      await p.goto('https://airion-cargo.store/login', { waitUntil:'networkidle' });
      await p.waitForTimeout(1400);
      await p.fill('input[name="email"]', email);
      await p.fill('input[name="password"]', 'QaPass123!');
      await p.evaluate(() => { const b=[...document.querySelectorAll('button[type=submit]')]; if(b.length) b[0].click(); });
      await p.waitForTimeout(6000);
      await p.goto(`https://airion-cargo.store/w/${W}/settings/sessions`, { waitUntil:'networkidle' });
      await p.waitForTimeout(2400);
      const before = await p.evaluate(`(() => { const t=((document.querySelector('main')||document.body).innerText||'');
        return (t.match(/Mozilla\\/5\\.0/g)||[]).length; })()`);
      await p.evaluate(`(() => { const vis=(${VIS});
        const b=[...document.querySelectorAll('button')].filter(vis)
          .filter(x=>/^Sign out other sessions$/.test((x.innerText||'').trim()));
        if(b.length===1) b[0].click(); })()`);
      await p.waitForTimeout(3000);
      await p.reload({ waitUntil:'networkidle' }); await p.waitForTimeout(2200);
      const mid = await p.evaluate(`(() => { const t=((document.querySelector('main')||document.body).innerText||'');
        return (t.match(/Mozilla\\/5\\.0/g)||[]).length; })()`);
      // now sign this one out too, via the profile menu
      await p.goto(`https://airion-cargo.store/w/${W}/chat`, { waitUntil:'networkidle' });
      await p.waitForTimeout(2200);
      await p.evaluate(`(() => { const vis=(${VIS});
        const b=[...document.querySelectorAll('button,[role=button]')].filter(vis)
          .filter(e=>(e.getAttribute('aria-label')||'')==='Profile'); if(b.length) b[0].click(); })()`);
      await p.waitForTimeout(1800);
      await p.evaluate(`(() => { const vis=(${VIS});
        const m=[...document.querySelectorAll('[role=menu],[data-radix-popper-content-wrapper]')].filter(vis)
          .sort((a,b)=>(b.innerText||'').length-(a.innerText||'').length)[0];
        if(!m) return; const s=[...m.querySelectorAll('button,a,[role=menuitem]')].filter(vis)
          .filter(e=>/^Sign out$/.test((e.innerText||'').trim())); if(s.length) s[0].click(); })()`);
      await p.waitForTimeout(4000);
      const after = await p.evaluate(async () => {
        const r=await fetch('/api/v1/auth/me',{credentials:'include'});
        return { status:r.status, url:location.pathname }; });
      out.push({ email, sessionsBefore:before, afterSignOutOthers:mid, afterSignOut:after });
    } catch(e) { out.push({ email, err:String(e).slice(0,90) }); }
    await ctx.close();
  }
  return out;
};
