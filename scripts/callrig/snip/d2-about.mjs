const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/about`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2600);
  return await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const t=(main.innerText||'').replace(/\\s+/g,' ');
    const i=t.lastIndexOf('›'); const body=(i>=0?t.slice(i+1):t).trim();
    const links=[...main.querySelectorAll('a[href]')].filter(vis)
      .map(a=>({ text:(a.innerText||'').trim().slice(0,34), href:a.getAttribute('href').slice(0,80),
                 target:a.getAttribute('target')||'' }));
    const btns=[...main.querySelectorAll('button')].filter(vis)
      .map(b=>({ t:(b.innerText||'').trim().slice(0,30), dis:b.disabled }));
    // anything that looks like a version string anywhere on the page
    const versions=[...new Set((body.match(/v?\\d+\\.\\d+\\.\\d+(?:-[A-Za-z0-9.]+)?/g)||[]))];
    return { body: body.slice(0,600), links, buttons:btns, versionsOnScreen:versions,
             dplIdInDom: document.documentElement.getAttribute('data-dpl-id') }; })()`);
};
