const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const PATH = process.env.D2_PATH || 'notifications';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/${PATH}`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2600);
  return await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const nodes=[...main.querySelectorAll('button,input,select,textarea,[role=switch],[role=combobox],[role=radio]')]
      .filter(vis).filter(e=>e.getBoundingClientRect().left>300)
      .filter(e=>(e.getAttribute('placeholder')||'')!=='Filter settings');
    const near=e=>{ let n=e,best=''; for(let i=0;i<5&&n;i++){ n=n.parentElement; if(!n)break;
      const t=(n.innerText||'').replace(/\\s+/g,' ').trim(); if(t.length>3&&t.length<130){best=t;break;} } return best; };
    return { path:location.pathname, count:nodes.length,
      controls: nodes.map(e=>({
        tag:e.tagName.toLowerCase(), role:e.getAttribute('role')||'', type:e.getAttribute('type')||'',
        state: e.getAttribute('aria-checked') ?? (e.type==='checkbox'?String(e.checked):null),
        val: (e.tagName==='BUTTON'||e.getAttribute('role')==='combobox') ? (e.innerText||'').trim().slice(0,32) : String(e.value||'').slice(0,32),
        dis: e.disabled===true||e.getAttribute('aria-disabled')==='true',
        y: Math.round(e.getBoundingClientRect().top),
        label: near(e).slice(0,90) })) }; })()`);
};
