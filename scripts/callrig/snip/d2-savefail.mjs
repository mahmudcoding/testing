const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const CASES = [
    ['notifications', '**/api/v1/notifications/settings', 'switch', 1],
    ['privacy',       '**/api/v1/auth/me/settings',       'switch', 0],
  ];
  const out=[];
  for (const [path, pattern, kind, idx] of CASES) {
    await page.goto(`https://airion-cargo.store/w/${W}/settings/${path}`, { waitUntil:'networkidle' });
    await page.waitForTimeout(2600);
    const stateBefore = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
      const l=[...main.querySelectorAll('[role=switch]')].filter(vis).filter(e=>e.getBoundingClientRect().left>300);
      return l.map(e=>e.getAttribute('aria-checked')); })()`);
    let aborted=0;
    await page.route(pattern, r => { if (r.request().method()==='GET') return r.continue();
      aborted++; return r.abort('failed'); });
    // flip and save
    await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
      const l=[...main.querySelectorAll('[role=switch]')].filter(vis).filter(e=>e.getBoundingClientRect().left>300);
      if(l[${idx}]) l[${idx}].click(); })()`);
    await page.waitForTimeout(1100);
    const notices=[];
    const poll=setInterval(async()=>{ try{
      const n=await page.evaluate(`(() => { const vis=(${VIS});
        return [...document.querySelectorAll('[data-sonner-toast],[role=status],[role=alert],[class*=oast]')].filter(vis)
          .map(e=>(e.innerText||'').replace(/\\s+/g,' ').trim()).filter(Boolean); })()`);
      for(const x of n) if(!notices.includes(x)) notices.push(x);
    }catch{} }, 300);
    await page.evaluate(`(() => { const vis=(${VIS});
      const b=[...document.querySelectorAll('button')].filter(vis).filter(x=>/^Save/.test((x.innerText||'').trim()));
      if(b.length) b[0].click(); })()`);
    await page.waitForTimeout(5000);
    clearInterval(poll);
    const afterSave = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
      const l=[...main.querySelectorAll('[role=switch]')].filter(vis).filter(e=>e.getBoundingClientRect().left>300);
      return { switches:l.map(e=>e.getAttribute('aria-checked')),
        bar:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim()).filter(t=>/^(Save|Discard)/.test(t)) }; })()`);
    await page.unroute(pattern);
    await page.goto(`https://airion-cargo.store/w/${W}/settings/${path}`, { waitUntil:'networkidle' });
    await page.waitForTimeout(2600);
    const afterReload = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
      const l=[...main.querySelectorAll('[role=switch]')].filter(vis).filter(e=>e.getBoundingClientRect().left>300);
      return l.map(e=>e.getAttribute('aria-checked')); })()`);
    out.push({ path, aborted, stateBefore, afterSave, notices, afterReload,
      lookedSaved: afterSave.bar.length===0, actuallyChanged: JSON.stringify(stateBefore)!==JSON.stringify(afterReload) });
  }
  return out;
};
