const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const out={};
  for (const [k,r,needle] of [['workspaces','settings/admin/workspaces','who may open it'],
                              ['dashboard','settings/admin/company','recent activity']]) {
    await page.goto(`https://airion-cargo.store/w/${W}/${r}`, { waitUntil:'networkidle' });
    await page.waitForTimeout(2800);
    out[k] = await page.evaluate(`(() => { const vis=(${VIS});
      const main=document.querySelector('main')||document.body;
      const t=(main.innerText||'').replace(/\\s+/g,' ');
      const i=t.lastIndexOf('›'); const body=(i>=0?t.slice(i+1):t).trim();
      const ctl=[...main.querySelectorAll('button,a[href],[role=tab],[role=button]')].filter(vis)
        .filter(e=>e.getBoundingClientRect().left>300)
        .map(e=>(e.innerText||e.getAttribute('aria-label')||'').replace(/\\s+/g,' ').trim()).filter(Boolean);
      return { subtitleHasPromise: body.includes(${JSON.stringify(needle)}),
               promiseWordCountOnPage: (body.match(new RegExp(${JSON.stringify(needle)},'gi'))||[]).length,
               bodyChars: body.length, controls:[...new Set(ctl)].slice(0,10),
               body: body.slice(0,200) }; })()`);
  }
  return out;
};
