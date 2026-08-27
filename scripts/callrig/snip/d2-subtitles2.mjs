const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const out=[];
  for (const [name,path] of [['Company',`/w/${W}/settings/company`],['Workspace',`/w/${W}/settings/workspace`],['Security',`/w/${W}/settings/security`]]) {
    await page.goto('https://airion-cargo.store'+path, { waitUntil:'networkidle' });
    await page.waitForTimeout(3200);
    const r = await page.evaluate(`(() => { const vis = ${VIS};
      const main=document.querySelector('main')||document.body;
      const navH=new Set([...document.querySelectorAll('a[href*="/settings/"]')].map(a=>a.getAttribute('href')));
      const items=[...main.querySelectorAll('button,input,select,textarea,[role=switch],[role=combobox],[role=radio],a')].filter(vis)
        .filter(e=>!(e.tagName==='A'&&navH.has(e.getAttribute('href'))))
        .filter(e=>(e.getAttribute('placeholder')||'')!=='Filter settings')
        .map(e=>{ let l=e.getAttribute('aria-label')||'';
          if(!l){ let p=e.parentElement; for(let i=0;i<4&&p;i++){ if(p.querySelectorAll('button,input,select,textarea,[role=switch],[role=combobox]').length===1){ const t=(p.innerText||'').trim(); if(t&&t.length<80){l=t.replace(/\\n/g,' | ');break;} } p=p.parentElement; } }
          if(!l) l=(e.innerText||'').trim()||e.getAttribute('placeholder')||'';
          return (e.tagName.toLowerCase()+(e.getAttribute('role')?'['+e.getAttribute('role')+']':'')+' '+l.slice(0,50)+(e.disabled?' [DISABLED]':'')); });
      const t=(main.innerText||''); const i=t.lastIndexOf('›');
      const content=(i>=0?t.slice(i+1):t).replace(/\\n+/g,' | ').trim();
      return { fullContent: content.slice(0,900), controls: items,
        probes: { url:/\\bURL\\b|slug|address/i.test(content), defaultChannel:/default channel/i.test(content.replace(/Name, URL, and default channel[^|]*/,'')),
                  encryptionKeys:/encryption key/i.test(content.replace(/Your password, two-factor authentication and encryption keys\\.?/,'')),
                  workspaceList:/QA Workspace/.test(content) } }; })()`);
    out.push({ page:name, ...r });
  }
  return out;
};
