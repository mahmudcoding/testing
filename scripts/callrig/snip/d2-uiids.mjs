const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const ids=new Set(); const urls=[];
  page.on('response', async r => {
    const u=r.url().replace(/^https?:\/\/[^/]+/,'');
    if(!/admin\/audit-log\?/.test(u)) return;
    urls.push(u.slice(0,100));
    try { const j=await r.json();
      const arr=Array.isArray(j)?j:((j&&j.entries)||[]);
      arr.forEach(e=>ids.add(e.id)); } catch {}
  });
  await page.goto(`https://airion-cargo.store/w/${W}/settings/admin/audit-log`, { waitUntil:'networkidle' });
  await page.waitForTimeout(3200);
  const next = `(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const b=[...main.querySelectorAll('button')].filter(vis).filter(x=>/^Next$/i.test((x.innerText||'').trim()));
    if(b.length!==1) return 'no-button';
    if(b[0].disabled) return 'disabled';
    b[0].click(); return 'clicked'; })()`;
  for (let i=0;i<6;i++){
    const r=await page.evaluate(next);
    if(r!=='clicked') break;
    await page.waitForTimeout(3200);
  }
  // the four ids my replay said were lost
  const suspects=['A4OWQRAF9EKRM3G','A4OWQRAE712YCRU','A4OWQRACHTMQLXY','A4OWQRAARJCLG6Q'];
  return { requestsMade:urls, idsDeliveredToUi: ids.size,
           suspectsPresent: suspects.map(id=>({id, delivered: ids.has(id)})) };
};
