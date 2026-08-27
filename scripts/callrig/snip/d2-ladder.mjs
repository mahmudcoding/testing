const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const routes=['account','profile','notifications','appearance','privacy','security','sessions','about','company','workspace'];
  const found={};
  for (const r of routes) {
    await page.goto(`https://airion-cargo.store/w/${W}/settings/${r}`, { waitUntil:'networkidle' });
    await page.waitForTimeout(2100);
    found[r] = await page.evaluate(`(() => { const vis=(${VIS});
      const main=document.querySelector('main')||document.body;
      const near=e=>{ let n=e,b=''; for(let i=0;i<5&&n;i++){n=n.parentElement; if(!n)break;
        const t=(n.innerText||'').replace(/\\s+/g,' ').trim(); if(t.length>4&&t.length<130){b=t;break;} } return b; };
      return [...main.querySelectorAll('[role=switch],[role=combobox],[role=radio],input[type=checkbox]')].filter(vis)
        .filter(e=>e.getBoundingClientRect().left>300)
        .map(e=>({ kind:e.getAttribute('role')||'checkbox',
                   st:e.getAttribute('aria-checked')||String(e.checked||''),
                   label:near(e).slice(0,80) })); })()`);
  }
  const server = await page.evaluate(async () => {
    const me=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const n=await (await fetch('/api/v1/notifications/settings',{credentials:'include'})).json();
    const flat={}; const walk=(o,p)=>{ for(const k in o){ const v=o[k];
      if(v&&typeof v==='object'&&!Array.isArray(v)) walk(v,p+k+'.'); else flat[p+k]=v; } };
    walk(me.settings||{}, 'settings.'); walk(n,'notifications.');
    return flat;
  });
  return { server, found };
};
