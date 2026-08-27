const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const me = await (async()=>{ await page.goto('https://airion-cargo.store/', {waitUntil:'networkidle'}); await page.waitForTimeout(1800);
    return page.evaluate(async () => { const j=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
      const w=await (await fetch('/api/v1/users/me/workspaces',{credentials:'include'})).json();
      return { email:j.email, landedAt:location.pathname,
               workspaces:(w.workspaces||[]).map(x=>({id:x.id,name:x.name,type:x.type})) }; }); })();
  const pages={};
  const errs=[];
  page.on('console', m => { if(m.type()==='error') errs.push(m.text().slice(0,100)); });
  for (const path of ['account','workspace','company','roles?scope=company','admin/members','admin/audit-log']) {
    const codes=[];
    const h = r => { const u=r.url().replace(/^https?:\/\/[^/]+/,''); if(/\/api\/v1\//.test(u)&&r.status()>=400) codes.push(`${r.status()} ${u.slice(0,50)}`); };
    page.on('response', h);
    await page.goto(`https://airion-cargo.store/w/${W}/settings/${path}`, { waitUntil:'networkidle' });
    await page.waitForTimeout(2300);
    page.off('response', h);
    pages[path] = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
      const t=(main.innerText||'').replace(/\\s+/g,' '); const i=t.lastIndexOf('›');
      const body=(i>=0?t.slice(i+1):t).trim();
      return { url:location.pathname, chars:body.length, head:body.slice(0,150),
        denied:/do not have permission|Admin access required|not allowed|not a member/i.test(body),
        looksBroken:/undefined|null|NaN|\\[object/i.test(body),
        controls:[...main.querySelectorAll('button,input,select')].filter(vis)
          .filter(e=>e.getBoundingClientRect().left>300)
          .filter(e=>(e.getAttribute('placeholder')||'')!=='Filter settings').length }; })()`);
    pages[path].errors = codes.slice(0,3);
  }
  return { me, consoleErrors:errs.slice(0,5), pages };
};
