const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/profile`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2600);
  // baseline set of visible leaf texts BEFORE the action
  const snap = `(() => { const vis=(${VIS});
    return [...document.querySelectorAll('body *')].filter(e=>!e.children.length).filter(vis)
      .map(e=>(e.innerText||'').replace(/\\s+/g,' ').trim()).filter(Boolean); })()`;
  const base = new Set(await page.evaluate(snap));
  await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const ins=[...main.querySelectorAll('input[type=text],input:not([type])')].filter(vis).filter(i=>i.type!=='search');
    const t=ins.find(i=>/QA /.test(i.value))||ins[0];
    const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
    setter.call(t,'QA Alice R'); t.dispatchEvent(new Event('input',{bubbles:true})); })()`);
  await page.waitForTimeout(1000);
  const baseDirty = new Set(await page.evaluate(snap));
  // poll from the instant of the click, uncapped, ~250ms
  const seen=[]; const t0=Date.now();
  await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const b=[...main.querySelectorAll('button')].filter(vis).filter(x=>/^Save/i.test((x.innerText||'').trim()));
    if(b.length===1) b[0].click(); })()`);
  while (Date.now()-t0 < 15000) {
    const now = await page.evaluate(snap);
    for (const s of now) if (!baseDirty.has(s) && !base.has(s))
      seen.push({ t: Date.now()-t0, text: s.slice(0,150) });
    await page.waitForTimeout(250);
  }
  const uniq=[]; const seenSet=new Set();
  for (const x of seen) if(!seenSet.has(x.text)){ seenSet.add(x.text); uniq.push(x); }
  const after = await page.evaluate(`(async()=>{const a=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    return a.name;})()`);
  return { newTextsAfterSave: uniq.slice(0,12), totalNewSamples: seen.length, nameAfter: after };
};
