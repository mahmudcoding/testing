// Reset Appearance to fixture defaults.
// Needed after d2-verify1.mjs, which sets Sidebar position = Right and does not restore it.
// Cookie-backed settings (theme, density, accent, sidebarSide, sidebarTone, railTone) must be
// clicked in the UI — writing localStorage alone does not clear their cookies.
const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
const DEFAULTS = { theme:'system', density:'cozy', accent:'#2454D8', msgLayout:'standard',
  sidebarSide:'left', sidebarTone:'light', railTone:'dark', showRoles:true,
  linkPreviews:true, markdownPreviewPanel:false, animations:true };
// section label -> the option that is the default
const CLICKS = [['Sidebar position','Left'], ['Message layout','Standard'], ['Density','Cozy']];
export default async ({ page }) => {
  const W = process.env.D2_WS || 'W4QDF1XTURESO01';
  const go = async () => { await page.goto(`https://airion-cargo.store/w/${W}/settings/appearance`,
    { waitUntil:'networkidle' }); await page.waitForTimeout(2600); };
  await go();
  const clicked = [];
  for (const [section, option] of CLICKS) {
    const r = await page.evaluate(`(() => { const vis=(${VIS});
      const main=document.querySelector('main')||document.body;
      const lab=[...main.querySelectorAll('*')].filter(e=>!e.children.length).filter(vis)
        .find(e=>(e.innerText||'').trim()===${JSON.stringify('')}+'${section}');
      if(!lab) return 'no section';
      const ly=lab.getBoundingClientRect().top;
      const c=[...main.querySelectorAll('[role=radio]')].filter(vis)
        .filter(x=>(x.innerText||'').trim()==='${option}')
        .map(x=>({el:x, dy:x.getBoundingClientRect().top-ly})).filter(x=>x.dy>=0&&x.dy<140)
        .sort((a,b)=>a.dy-b.dy)[0];
      if(!c) return 'no option';
      if(c.el.getAttribute('aria-checked')==='true') return 'already default';
      c.el.click(); return 'clicked'; })()`);
    clicked.push(`${section} -> ${option}: ${r}`);
    await page.waitForTimeout(1200);
  }
  // non-cookie fields live only in the blob; write them straight
  await page.evaluate(`(() => { try {
      const cur=JSON.parse(localStorage.getItem('aloqa.appearance')||'{}');
      localStorage.setItem('aloqa.appearance', JSON.stringify({...cur, ...${JSON.stringify(DEFAULTS)}}));
    } catch {} })()`);
  await go();
  const final = await page.evaluate(`(() => { try {
      return JSON.parse(localStorage.getItem('aloqa.appearance')||'null'); } catch { return null; } })()`);
  const off = final ? Object.entries(DEFAULTS).filter(([k,v])=>final[k]!==v).map(([k])=>k) : ['(no stored blob — defaults apply)'];
  return { clicked, stored: final, differingFromDefaults: off };
};
