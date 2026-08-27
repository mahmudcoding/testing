const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const reqs=[];
  page.on('request', r => { const u=r.url().replace(/^https?:\/\/[^/]+/,'');
    if(/admin\/audit-log/.test(u)) reqs.push(u); });
  const cancelled=[];
  page.on('download', async d => { cancelled.push(d.suggestedFilename()); try{ await d.cancel(); }catch{} });
  await page.goto(`https://airion-cargo.store/w/${W}/settings/admin/audit-log`, { waitUntil:'networkidle' });
  await page.waitForTimeout(3200);
  reqs.length=0;
  const clicked = await page.evaluate(`(() => { const vis=(${VIS});
    const b=[...document.querySelectorAll('button')].filter(vis).filter(x=>/^Export JSON$/.test((x.innerText||'').trim()));
    if(b.length!==1) return {n:b.length}; b[0].click(); return {n:1}; })()`);
  await page.waitForTimeout(9000);
  const notices = await page.evaluate(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('[data-sonner-toast],[role=status],[role=alert],[class*=oast]')].filter(vis)
      .map(e=>(e.innerText||'').replace(/\\s+/g,' ').trim()).filter(Boolean).slice(0,3); })()`);
  const limits = reqs.map(u=>{const m=u.match(/limit=(\d+)/); return m?m[1]:'?';});
  const hist = limits.reduce((a,l)=>{a[l]=(a[l]||0)+1;return a;},{});
  return { clicked, totalRequests:reqs.length, limitHistogram:hist,
           downloadStarted:cancelled, notices,
           sample:reqs.slice(0,2).map(u=>u.slice(0,100)) };
};
