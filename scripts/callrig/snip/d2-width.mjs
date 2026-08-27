const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const WIDTH = Number(process.env.D2_W || 1280);
  await page.setViewportSize({ width: WIDTH, height: 900 });
  const routes=['account','profile','notifications','appearance','privacy','security','sessions','about',
                'company','workspace','roles?scope=company','admin/company','admin/members','admin/invites',
                'admin/workspaces','admin/audit-log'];
  const out=[];
  for (const r of routes) {
    await page.goto(`https://airion-cargo.store/w/${W}/settings/${r}`, { waitUntil:'networkidle' });
    await page.waitForTimeout(1900);
    const m = await page.evaluate(`(() => { const vis=(${VIS});
      const de=document.documentElement;
      const main=document.querySelector('main')||document.body;
      // clipped leaf text nodes
      const clipped=[...main.querySelectorAll('*')].filter(e=>!e.children.length).filter(vis)
        .filter(e=>e.scrollWidth>e.clientWidth+1 && (e.innerText||'').trim().length>2)
        .map(e=>({t:(e.innerText||'').trim().slice(0,34), sw:e.scrollWidth, cw:e.clientWidth,
                  ov:getComputedStyle(e).overflowX}));
      // controls pushed past the viewport
      const offscreen=[...main.querySelectorAll('button,input,select,a[href],[role=switch],[role=combobox]')]
        .filter(vis).filter(e=>e.getBoundingClientRect().left>=innerWidth-1)
        .map(e=>((e.innerText||'').trim()||e.getAttribute('aria-label')||'<'+e.tagName.toLowerCase()+'>').slice(0,26));
      return { pageSideways: de.scrollWidth>de.clientWidth,
               docSW:de.scrollWidth, docCW:de.clientWidth,
               clipped:clipped.filter(c=>c.ov!=='auto'&&c.ov!=='scroll').slice(0,4),
               clippedCount:clipped.length, offscreen }; })()`);
    out.push({ route:r, ...m });
  }
  await page.setViewportSize({ width: 1920, height: 1080 });
  return { width:WIDTH, results:out };
};
