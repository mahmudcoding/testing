const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/account`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  const perms = await page.evaluate(async () => {
    const W='W4QDF1XTURESO01';
    const r = await fetch(`/api/v1/workspaces/${W}/members?limit=50`, { credentials:'include' });
    const j = await r.json(); const arr=j.members||j.items||[];
    const me = arr.find(m=>m.user_id==='U4QDALICE000001')||{};
    return { roles:(me.roles||[]).map(x=>x.name), permissions:(me.roles||[]).flatMap(x=>x.permissions||[]) };
  });
  await page.goto(`https://airion-cargo.store/w/${W}/settings/admin/invites`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3500);
  const ENUM = `() => { const vis = (${VIS});
    const main=document.querySelector('main')||document.body;
    const navH=new Set([...document.querySelectorAll('a[href*="/settings/"]')].map(a=>a.getAttribute('href')));
    return [...main.querySelectorAll('button,input,select,textarea,[role=switch],[role=combobox]')].filter(vis)
      .filter(e=>!(e.tagName==='A'&&navH.has(e.getAttribute('href'))))
      .map(e=>{ let l=e.getAttribute('aria-label')||'';
        if(!l){ let p=e.parentElement; for(let i=0;i<4&&p;i++){ if(p.querySelectorAll('button,input,select,[role=combobox]').length===1){ const t=(p.innerText||'').trim(); if(t&&t.length<70){l=t.replace(/\\n/g,' | ');break;} } p=p.parentElement; } }
        if(!l) l=(e.innerText||'').trim()||e.getAttribute('placeholder')||'';
        return { tag:e.tagName.toLowerCase(), label:l.slice(0,52),
                 disabled: e.disabled===true||e.getAttribute('aria-disabled')==='true'||e.hasAttribute('disabled') }; }); }`;
  const polls = [];
  for (let i=0;i<4;i++) { polls.push(await page.evaluate(`(${ENUM})()`)); await page.waitForTimeout(1500); }
  const stable = polls.every(p => JSON.stringify(p) === JSON.stringify(polls[0]));
  const pageText = await page.evaluate(`(() => { const m=document.querySelector('main')||document.body;
    const t=(m.innerText||''); const i=t.lastIndexOf('›'); return (i>=0?t.slice(i+1):t).replace(/\\n+/g,' | ').trim().slice(0,300); })()`);
  return { alicePerms: perms, pageText, controlCount: polls[0].length,
           allDisabled: polls[0].every(c=>c.disabled), stableAcross4Polls: stable, controls: polls[0] };
};
