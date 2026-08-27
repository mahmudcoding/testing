const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const out={};
  for (const path of ['workspace','admin/workspaces']) {
    await page.goto(`https://airion-cargo.store/w/${W}/settings/${path}`, { waitUntil:'networkidle' });
    await page.waitForTimeout(2600);
    // expand any storage toggle
    await page.evaluate(`(() => { const vis=(${VIS});
      const b=[...document.querySelectorAll('button')].filter(vis).filter(x=>/Show storage/i.test((x.innerText||'').trim()));
      if(b.length) b[0].click(); })()`);
    await page.waitForTimeout(2200);
    out[path] = await page.evaluate(`(() => { const vis=(${VIS});
      const main=document.querySelector('main')||document.body;
      const t=(main.innerText||'').replace(/\\s+/g,' ');
      const i=t.lastIndexOf('›');
      const body=(i>=0?t.slice(i+1):t).trim();
      const hits=[...main.querySelectorAll('*')].filter(e=>!e.children.length).filter(vis)
        .map(e=>(e.innerText||'').replace(/\\s+/g,' ').trim())
        .filter(x=>/storage|GB|MB|quota/i.test(x));
      return { hasMyStorage:/My storage/i.test(body), storageStrings:[...new Set(hits)].slice(0,10),
               body:body.slice(0,300) }; })()`);
  }
  return out;
};
