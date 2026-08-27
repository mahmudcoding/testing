const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const out={};
  const net=[];
  const onReq = r => { const u=r.url().replace(/^https?:\/\/[^/]+/,'');
    if (/storage|quota/i.test(u)) net.push(`${r.method()} ${u.slice(0,70)}`); };
  page.on('request', onReq);
  for (const [key,path] of [['settings/workspace',`/w/${W}/settings/workspace`],
                            ['settings/admin/workspaces',`/w/${W}/settings/admin/workspaces`]]) {
    net.length=0;
    await page.goto(`https://airion-cargo.store${path}`, { waitUntil:'networkidle' });
    await page.waitForTimeout(2600);
    // expand any storage disclosure that exists
    const expanded = await page.evaluate(`(() => { const vis=(${VIS});
      const b=[...document.querySelectorAll('button')].filter(vis)
        .filter(x=>/storage/i.test((x.innerText||'')));
      b.forEach(x=>x.click()); return b.map(x=>(x.innerText||'').trim().slice(0,24)); })()`);
    await page.waitForTimeout(2200);
    out[key] = await page.evaluate(`(() => { const vis=(${VIS});
      const main=document.querySelector('main')||document.body;
      const t=(main.innerText||'').replace(/\\s+/g,' ');
      return { mentionsStorage:/storage/i.test(t),
               showsBytes:/\\d+(\\.\\d+)?\\s?(B|KB|MB|GB)\\b/.test(t),
               unavailable:/unavailable|не удалось|—\\s*of\\s*—/i.test(t),
               excerpt:(t.match(/[^.]{0,40}storage[^]{0,120}/i)||[])[0]||null }; })()`);
    out[key].storageRequests=[...net];
    out[key].expandedButtons=expanded;
  }
  page.off('request', onReq);
  return out;
};
