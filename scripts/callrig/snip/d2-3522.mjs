const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const probe = `(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    return /unsaved change/i.test((main.innerText||'').replace(/\\s+/g,' ')); })()`;
  const runs=[];
  for (let r=0;r<3;r++){
    await page.goto(`https://airion-cargo.store/w/${W}/settings/appearance`, { waitUntil:'networkidle' });
    await page.waitForTimeout(1200);
    const seen=[]; const t0=Date.now();
    const nav = page.goto(`https://airion-cargo.store/w/${W}/settings/profile`, { waitUntil:'networkidle' }).catch(()=>{});
    while (Date.now()-t0 < 8000) {
      try { seen.push((await page.evaluate(probe))?1:0); } catch { seen.push('x'); }
      await page.waitForTimeout(200);
    }
    await nav;
    runs.push({ samples:seen.length, everShown: seen.includes(1), sequence: seen.join('').slice(0,44) });
  }
  // control: a real edit must raise it
  const ctl = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const ins=[...main.querySelectorAll('input[type=text],input:not([type])')].filter(vis).filter(i=>i.type!=='search');
    const t=ins[1]||ins[0]; if(!t) return 'no input';
    const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
    s.call(t,'x'); t.dispatchEvent(new Event('input',{bubbles:true})); return 'typed'; })()`);
  await page.waitForTimeout(1500);
  const afterEdit = await page.evaluate(probe);
  await page.goto(`https://airion-cargo.store/w/${W}/settings/appearance`, { waitUntil:'networkidle' });
  return { runs, control:{ typed:ctl, panelAppears:afterEdit } };
};
