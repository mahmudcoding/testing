const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
const LBL = `(e) => { let l=e.getAttribute('aria-label')||'';
  if(!l){ let p=e.parentElement; for(let i=0;i<5&&p;i++){ const n=p.querySelectorAll('button,input,select,[role=switch],[role=combobox]').length;
    if(n===1){ const t=(p.innerText||'').trim(); if(t&&t.length<110){ l=t.replace(/\\n/g,' | '); break; } } p=p.parentElement; } }
  return l.slice(0,100); }`;
export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/privacy', { waitUntil:'networkidle' });
  await page.waitForTimeout(3200);
  const layout = await page.evaluate(`(() => { const vis=(${VIS}); const lbl=(${LBL});
    const main=document.querySelector('main')||document.body;
    const navH=new Set([...document.querySelectorAll('a[href*="/settings/"]')].map(a=>a.getAttribute('href')));
    const items=[...main.querySelectorAll('button,input,select,[role=switch],[role=combobox]')].filter(vis)
      .filter(e=>!(e.tagName==='A'&&navH.has(e.getAttribute('href'))))
      .filter(e=>(e.getAttribute('placeholder')||'')!=='Filter settings')
      .map(e=>({ tag:e.tagName.toLowerCase(), role:e.getAttribute('role')||'',
                 label: lbl(e), text:(e.innerText||'').trim().slice(0,30),
                 checked:e.getAttribute('aria-checked'), y: Math.round(e.getBoundingClientRect().y) }));
    const heads=[...main.querySelectorAll('h1,h2,h3,h4')].filter(vis)
      .map(h=>({ t:h.innerText.trim().slice(0,50), y:Math.round(h.getBoundingClientRect().y) }));
    return { headings: heads, controls: items }; })()`);
  const server = await page.evaluate(async () => {
    const r=await fetch('/api/v1/auth/me',{credentials:'include'}); const j=await r.json();
    const u=j.user||j; return { privacy:(u.settings||{}).privacy, presence:u.presence }; });
  return { layout, server };
};
