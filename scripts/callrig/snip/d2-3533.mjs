const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const snap = `(() => { const vis=(${VIS});
    return [...document.querySelectorAll('body *')].filter(e=>!e.children.length).filter(vis)
      .map(e=>(e.innerText||'').replace(/\\s+/g,' ').trim()).filter(Boolean); })()`;
  await page.goto(`https://airion-cargo.store/w/${W}/directories?tab=people`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2800);
  await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const el=[...main.querySelectorAll('button,a[href],[role=button]')].filter(vis)
      .filter(b=>/QA Alice/.test(b.innerText||''))[0];
    if(el) el.click(); })()`);
  await page.waitForTimeout(2200);
  const base=new Set(await page.evaluate(snap));
  const net=[];
  page.on('response', async r => { const m=r.request().method();
    if(m==='GET'||!/block/i.test(r.url())) return;
    net.push(`${m} ${r.url().replace(/^https?:\/\/[^/]+/,'').slice(0,44)} -> ${r.status()}`); });
  // poll from the instant of the click
  const clicked = await page.evaluate(`(() => { const vis=(${VIS});
    const dlg=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
    const b=dlg? [...dlg.querySelectorAll('button')].filter(vis).filter(x=>/^Block$/i.test((x.innerText||'').trim()))[0]:null;
    if(!b||b.disabled) return 'unavailable'; b.click(); return 'clicked'; })()`);
  const seen=[]; const t0=Date.now();
  while (Date.now()-t0 < 12000) {
    for (const s of await page.evaluate(snap)) if(!base.has(s)) seen.push({t:Date.now()-t0, s:s.slice(0,90)});
    await page.waitForTimeout(250);
  }
  const uniq=[]; const set=new Set();
  for (const x of seen) if(!set.has(x.s)){ set.add(x.s); uniq.push(x); }
  const confirmDialog = await page.evaluate(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('[role=alertdialog],[role=dialog]')].filter(vis).length; })()`);
  return { clicked, newTextsAfterBlock: uniq.slice(0,10), dialogsNow: confirmDialog, blockRequests: net };
};
