const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/privacy', { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  const switches = await page.evaluate(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('main [role=switch]')].filter(vis).map(e=>{ let n=e.parentElement,box=null;
      for(let k=0;k<6&&n;k++){ if(n.querySelectorAll('[role=switch]').length===1) box=n; else break; n=n.parentElement; }
      return { label:((box?box.innerText:'')||'').replace(/\\n/g,' | ').slice(0,70), checked:e.getAttribute('aria-checked') }; }); })()`);
  const combos = await page.evaluate(`(() => { const vis=(${VIS});
    const c=[...document.querySelectorAll('main [role=combobox]')].filter(vis);
    const texts=[...document.querySelectorAll('main *')].filter(vis).filter(e=>e.children.length===0)
      .map(e=>({t:(e.innerText||'').trim(),y:e.getBoundingClientRect().y})).filter(x=>x.t&&x.t.length<60);
    return c.map(x=>{ const y=x.getBoundingClientRect().y; const a=texts.filter(q=>q.y<y&&q.y>y-70).sort((p,q)=>q.y-p.y);
      return (a.length?a[0].t:'(none)')+' = '+((x.innerText||'').trim().slice(0,20)); }); })()`);
  const server = await page.evaluate(async () => {
    const r=await fetch('/api/v1/auth/me',{credentials:'include'}); const j=await r.json(); const u=j.user||j;
    return { privacy:(u.settings||{}).privacy, presence:u.presence }; });
  return { switches, combos, server };
};
