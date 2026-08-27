const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const net=[];
  page.on('response', r => { const m=r.request().method();
    if(m!=='GET' && /auth\/me/.test(r.url())) net.push(`${m} ${r.url().replace(/^https?:\/\/[^/]+/,'').slice(0,40)} -> ${r.status()}`); });
  await page.goto(`https://airion-cargo.store/w/${W}/settings/profile`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2600);
  const panel = `(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const t=(main.innerText||'').replace(/\\s+/g,' ');
    return { unsaved:/unsaved change/i.test(t),
             save:[...main.querySelectorAll('button')].filter(vis)
               .some(b=>/^Save profile$/i.test((b.innerText||'').trim())) }; })()`;
  // type into the first editable profile field (Job title area)
  const typed = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const ins=[...main.querySelectorAll('input[type=text],input:not([type])')].filter(vis).filter(i=>i.type!=='search');
    const t=ins.find(i=>!/QA /.test(i.value)) || ins[1] || ins[0];
    if(!t) return {ok:false};
    const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
    s.call(t,'D2 flicker probe'); t.dispatchEvent(new Event('input',{bubbles:true}));
    return {ok:true, placeholder:(t.placeholder||'(none)').slice(0,26)}; })()`);
  await page.waitForTimeout(1400);
  const dirty = await page.evaluate(panel);
  net.length=0;
  await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const b=[...main.querySelectorAll('button')].filter(vis).filter(x=>/^Save profile$/i.test((x.innerText||'').trim()));
    if(b.length) b[0].click(); })()`);
  // poll from the click, ~200ms, for 12s — the ticket says the panel returns after 2-3s
  const samples=[]; const t0=Date.now();
  while (Date.now()-t0 < 12000) {
    samples.push({ t: Date.now()-t0, ...(await page.evaluate(panel)) });
    await page.waitForTimeout(200);
  }
  const seq=samples.map(s=>s.unsaved?1:0).join('');
  const reappeared = /1+0+1/.test(seq);
  return { typed, dirtyBeforeSave:dirty, requests:[...net],
           unsavedSequence: seq, panelReappearedAfterSave: reappeared,
           firstClearAt: (samples.find(s=>!s.unsaved)||{}).t,
           anyLateTrue: samples.filter(s=>s.unsaved && s.t>2000).map(s=>s.t).slice(0,5) };
};
