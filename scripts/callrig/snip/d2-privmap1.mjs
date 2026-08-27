const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/privacy`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2800);
  const api = await page.evaluate(`(async()=>{
    const a=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json().catch(()=>null);
    const p=await fetch('/api/v1/users/me/presence-settings',{credentials:'include'});
    return { privacy: a && a.settings ? a.settings.privacy : null,
             presence: p.status===200 ? await p.json() : p.status };})()`);
  const ui = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const label = el => { let n=el,l='';
      for(let i=0;i<6&&n;i++){ n=n.parentElement; if(!n) break;
        const t=(n.innerText||'').replace(/\\s+/g,' ').trim(); if(t&&t.length<130){l=t;break;} }
      return l.slice(0,72); };
    const switches=[...main.querySelectorAll('[role=switch]')].filter(vis)
      .map(s=>({ kind:'switch', checked:s.getAttribute('aria-checked'), label:label(s) }));
    const combos=[...main.querySelectorAll('button[aria-haspopup],[role=combobox]')].filter(vis)
      .map(b=>({ kind:'picker', value:(b.innerText||'').replace(/\\s+/g,' ').trim().slice(0,26), label:label(b) }));
    return { switches, pickers:combos }; })()`);
  return { api, ui };
};
