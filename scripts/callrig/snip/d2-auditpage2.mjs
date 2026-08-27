const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const net=[];
  const onReq = r => { const u=r.url().replace(/^https?:\/\/[^/]+/,'');
    if (/audit-log/.test(u)) net.push(`${r.method()} ${u.slice(0,90)}`); };
  page.on('request', onReq);
  await page.goto(`https://airion-cargo.store/w/${W}/settings/admin/audit-log`, { waitUntil:'networkidle' });
  await page.waitForTimeout(3200);
  const count = `(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    return [...main.querySelectorAll('tr')].filter(vis).filter(tr=>tr.querySelectorAll('td').length>=3).length; })()`;
  const before = await page.evaluate(count);
  const reqsBefore = net.length;
  // controls in the CONTENT area only (right of the settings nav)
  const contentControls = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    return [...main.querySelectorAll('button,a[href],[role=button]')].filter(vis)
      .filter(e=>e.getBoundingClientRect().left>300)
      .map(e=>(e.innerText||e.getAttribute('aria-label')||'').replace(/\\s+/g,' ').trim())
      .filter(Boolean); })()`);
  // scroll the real scroller to the very bottom, repeatedly, and watch for growth
  const steps=[];
  for (let i=0;i<6;i++){
    await page.evaluate(`(() => { const vis=(${VIS});
      const sc=[...document.querySelectorAll('*')].filter(e=>{const s=getComputedStyle(e);
        return e.scrollHeight-e.clientHeight>40 && /auto|scroll/.test(s.overflowY) && vis(e);})[0];
      if(sc) sc.scrollTop = sc.scrollHeight; })()`);
    await page.waitForTimeout(2000);
    steps.push({ pass:i+1, rows: await page.evaluate(count), auditRequests: net.length });
  }
  page.off('request', onReq);
  return { rowsBefore: before, contentControls: [...new Set(contentControls)],
           afterScrolling: steps, auditRequestsMade: net.slice(0,6), auditRequestsBefore: reqsBefore };
};
