const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/account`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2500);
  const perms = await page.evaluate(async () => {
    const co=await (await fetch('/api/v1/companies/O4QDF1XTURESO01/members?limit=100&offset=0',{credentials:'include'})).json();
    const ws=await (await fetch('/api/v1/workspaces/W4QDF1XTURESO01/members?limit=50',{credentials:'include'})).json();
    const f=j=>{const a=j.members||j.items||[];const m=a.find(x=>x.user_id==='U4QDALICE000001');return m?(m.roles||[]).flatMap(r=>r.permissions||[]):[];};
    return { company:f(co), workspace:f(ws) }; });
  const nav = await page.evaluate(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('a[href*="/settings/"]')].filter(vis)
      .map(a=>({ label:(a.innerText||'').trim(), href:a.getAttribute('href') }))
      .filter((v,i,arr)=>arr.findIndex(x=>x.href===v.href)===i); })()`);
  const out=[];
  for (const n of nav) {
    await page.goto('https://airion-cargo.store'+n.href, { waitUntil:'networkidle' });
    await page.waitForTimeout(1800);
    const r = await page.evaluate(`(() => { const vis=(${VIS});
      const main=document.querySelector('main')||document.body;
      const items=[...main.querySelectorAll('button,input,select,textarea,[role=switch],[role=combobox],[role=radio]')].filter(vis)
        .filter(e=>(e.getAttribute('placeholder')||'')!=='Filter settings');
      const t=(main.innerText||'');
      return { controls: items.length, enabled: items.filter(e=>!(e.disabled===true||e.getAttribute('aria-disabled')==='true')).length,
               denied: /do not have permission|Admin access required|not allowed/i.test(t) }; })()`);
    out.push({ nav: n.label, ...r });
  }
  return { permissions: perms, pages: out };
};
