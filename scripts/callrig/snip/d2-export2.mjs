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
  const t0=Date.now();
  await page.evaluate(`(() => { const vis=(${VIS});
    const b=[...document.querySelectorAll('button')].filter(vis).filter(x=>/^Export CSV$/.test((x.innerText||'').trim()));
    if(b.length===1) b[0].click(); })()`);
  await page.waitForTimeout(9000);
  const limits = reqs.map(u => { const m=u.match(/limit=(\d+)/); return m?m[1]:'?'; });
  const counts = limits.reduce((a,l)=>{a[l]=(a[l]||0)+1;return a;},{});
  return { totalRequests:reqs.length, limitHistogram:counts,
           first3:reqs.slice(0,3).map(u=>u.slice(0,110)),
           last2:reqs.slice(-2).map(u=>u.slice(0,110)),
           downloadCancelled:cancelled };
};
