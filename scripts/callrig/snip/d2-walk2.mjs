const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const targets = [['company',`/w/${W}/settings/company`],['workspace',`/w/${W}/settings/workspace`],
                   ['roles',`/w/${W}/settings/roles?scope=company`],['security',`/w/${W}/settings/security`]];
  const out=[];
  for (const [name,path] of targets) {
    await page.goto('https://airion-cargo.store'+path, { waitUntil:'networkidle' });
    await page.waitForTimeout(3000);
    const r = await page.evaluate(`(() => { const vis = ${VIS};
      const main=document.querySelector('main')||document.body;
      const navH=new Set([...document.querySelectorAll('a[href*="/settings/"]')].map(a=>a.getAttribute('href')));
      const items=[...main.querySelectorAll('button,input,select,textarea,[role=switch],[role=combobox],[role=radio],a')].filter(vis)
        .filter(e=>!(e.tagName==='A'&&navH.has(e.getAttribute('href'))))
        .filter(e=>(e.getAttribute('placeholder')||'')!=='Filter settings')
        .map(e=>{ let l=e.getAttribute('aria-label')||'';
          if(!l){ let p=e.parentElement; for(let i=0;i<4&&p;i++){ if(p.querySelectorAll('button,input,select,textarea,[role=switch],[role=combobox]').length===1){ const t=(p.innerText||'').trim(); if(t&&t.length<80){l=t.replace(/\\n/g,' | ');break;} } p=p.parentElement; } }
          if(!l) l=(e.innerText||'').trim()||e.getAttribute('placeholder')||'';
          return { tag:e.tagName.toLowerCase(), role:e.getAttribute('role')||'', label:l.slice(0,58),
                   dis:e.disabled===true||e.getAttribute('aria-disabled')==='true', val:String(e.value||'').slice(0,26) }; });
      const t=(main.innerText||''); const i=t.lastIndexOf('›');
      const heads=[...main.querySelectorAll('h1,h2,h3,h4')].filter(vis).map(h=>h.innerText.trim().slice(0,36));
      return { heads, count:items.length, items:items.slice(0,22),
               notYet:(t.match(/not available yet|coming soon/gi)||[]).length,
               content:(i>=0?t.slice(i+1):t).replace(/\\n+/g,' | ').trim().slice(0,240) }; })()`);
    out.push({ page:name, ...r });
  }
  return out;
};
