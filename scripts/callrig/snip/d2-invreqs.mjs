const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const seen=[];
  page.on('response', async r => {
    const u=r.url().replace(/^https?:\/\/[^/]+/,'');
    if(!/invite/i.test(u)) return;
    let n=null; try { const j=await r.json();
      const a=Array.isArray(j)?j:((j&&(j.invites||j.items||j.links))||[]);
      n=Array.isArray(a)?a.length:null;
      seen.push({ url:u.slice(0,84), method:r.request().method(), status:r.status(), items:n,
                  statuses: Array.isArray(a)? [...new Set(a.map(x=>x.status))] : null });
    } catch { seen.push({ url:u.slice(0,84), method:r.request().method(), status:r.status(), items:'(not json)' }); }
  });
  await page.goto(`https://airion-cargo.store/w/${W}/settings/admin/invites`, { waitUntil:'networkidle' });
  await page.waitForTimeout(3500);
  const rows = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    return [...main.querySelectorAll('tr')].filter(vis)
      .map(tr=>[...tr.querySelectorAll('td')].map(td=>(td.innerText||'').replace(/\\s+/g,' ').trim()))
      .filter(c=>c.length>=2).map(c=>c.join(' | ').slice(0,90)); })()`);
  return { invitesRequests: seen, rowsOnScreen: rows.length, sampleRows: rows.slice(0,6) };
};
