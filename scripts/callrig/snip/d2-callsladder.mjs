const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const SW = `(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    return [...main.querySelectorAll('[role=switch]')].filter(vis).filter(e=>e.getBoundingClientRect().left>300); })`;
  const load=async()=>{ await page.goto(`https://airion-cargo.store/w/${W}/settings/calls`,{waitUntil:'networkidle'}); await page.waitForTimeout(2800); };
  const store=()=>page.evaluate(`(() => { try{return JSON.parse(localStorage.getItem('aloqa-call-device-prefs')).state;}catch{return null;} })()`);
  const states=()=>page.evaluate(`(() => ${SW}().map(e=>e.getAttribute('aria-checked')))()`);
  const labels=()=>page.evaluate(`(() => ${SW}().map(e=>{ let n=e,b='';
    for(let k=0;k<5&&n;k++){n=n.parentElement; if(!n)break;
      const x=(n.innerText||'').replace(/\\s+/g,' ').trim(); if(x.length>4&&x.length<110){b=x;break;}} return b.slice(0,52); }))()`);
  const out=[];
  await load();
  const lab = await labels();
  const n = (await states()).length;
  for (let i=0;i<n;i++) {
    await load();
    const before = await states();
    const sBefore = await store();
    await page.evaluate(`(() => { const l=${SW}(); if(l[${i}]) l[${i}].click(); })()`);
    await page.waitForTimeout(1200);
    const afterClick = await states();
    const sAfterClick = await store();
    const bar = await page.evaluate(`(() => { const vis=(${VIS});
      return [...document.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim()).filter(t=>/^(Save|Discard)/.test(t)); })()`);
    if (bar.some(t=>/^Save/.test(t))) {
      await page.evaluate(`(() => { const vis=(${VIS});
        const b=[...document.querySelectorAll('button')].filter(vis).filter(x=>/^Save/.test((x.innerText||'').trim())); if(b.length) b[0].click(); })()`);
      await page.waitForTimeout(2200);
    }
    await load();
    const afterReload = await states();
    const sAfterReload = await store();
    out.push({ i, label:lab[i]||'(no label)', before:before[i], afterClick:afterClick[i], afterReload:afterReload[i],
               saveBar:bar, storeBefore:sBefore, storeAfterClick:sAfterClick, storeAfterReload:sAfterReload,
               survived: afterReload[i]===afterClick[i] });
  }
  return out;
};
