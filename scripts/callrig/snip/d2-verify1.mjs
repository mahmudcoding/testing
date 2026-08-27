const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
const CTL = `(root) => { const vis=(VISFN);
  return [...root.querySelectorAll('button,a[href],input,select,textarea,[role=switch],[role=combobox],[role=radio],[role=button]')]
    .filter(vis).filter(e=>e.getBoundingClientRect().left>300)
    .map(e=>({t:(e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,34),
              al:(e.getAttribute('aria-label')||'').slice(0,40),
              dis:e.disabled===true||e.getAttribute('aria-disabled')==='true'})); }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const ctl = CTL.replace('VISFN', VIS);
  const out={};
  const go=async p=>{ await page.goto(`https://airion-cargo.store${p}`,{waitUntil:'networkidle'}); await page.waitForTimeout(2500); };
  const grab=async()=>page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const t=(main.innerText||'').replace(/\\s+/g,' '); const i=t.lastIndexOf('›');
    return { text:(i>=0?t.slice(i+1):t).trim(), controls:(${ctl})(main) }; })()`);

  // #13 Sessions with a single session
  await go(`/w/${W}/settings/sessions`);
  const s = await grab();
  out.f13_sessions = { text:s.text.slice(0,220), controls:s.controls.map(c=>c.t||c.al).filter(Boolean),
                       claim:'no action offered', holds: s.controls.filter(c=>!c.dis).length===0 };

  // #14 /company/create has no way out
  await go('/company/create');
  const c = await grab();
  out.f14_companyCreate = { text:c.text.slice(0,200), controls:c.controls.map(x=>x.t||x.al).filter(Boolean),
                            interactiveCount:c.controls.length };

  // #15 four subtitles describing absent content
  const subs = {};
  for (const [k,p,needle] of [
      ['workspaces', `/w/${W}/settings/admin/workspaces`, 'who may open it'],
      ['dashboard',  `/w/${W}/settings/admin/company`,    'recent activity'],
      ['wsIdentity', `/w/${W}/settings/workspace`,        'URL'],
      ['sessions',   `/w/${W}/settings/sessions`,         'sign one out']]) {
    await go(p); const g=await grab();
    subs[k]={ subtitlePresent:g.text.includes(needle), needle, text:g.text.slice(0,160) };
  }
  out.f15_subtitles = subs;

  // #7 sidebar position: set right, then measure where the panels land
  await go(`/w/${W}/settings/appearance`);
  await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const rs=[...main.querySelectorAll('[role=radio]')].filter(vis).filter(r=>(r.innerText||'').trim()==='Right');
    if(rs.length===1) rs[0].click(); })()`);
  await page.waitForTimeout(1800);
  await go(`/w/${W}/settings/appearance`);
  out.f7_sidebar = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    let p=null; try{p=JSON.parse(localStorage.getItem('aloqa.appearance'));}catch{}
    const sel=[...main.querySelectorAll('[role=radio]')].filter(vis)
      .filter(r=>['Left','Right'].includes((r.innerText||'').trim()))
      .map(r=>((r.innerText||'').trim())+'='+r.getAttribute('aria-checked'));
    const panels=[...document.querySelectorAll('nav,aside')].filter(vis)
      .map(e=>{const b=e.getBoundingClientRect(); return {x:Math.round(b.x),w:Math.round(b.width)};})
      .filter(o=>o.w>120&&o.w<420).sort((a,b)=>a.x-b.x);
    return { stored:p&&p.sidebarSide, cookie:(document.cookie.match(/aloqa\\.sidebar=([^;]*)/)||[])[1]||null,
             radios:sel, panels, viewport:innerWidth }; })()`);
  return out;
};
