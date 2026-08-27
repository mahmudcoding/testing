const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const CASES = [
    ['admin/members',       '**/api/v1/companies/*/members*'],
    ['roles?scope=company', '**/api/v1/companies/*/roles*'],
    ['admin/audit-log',     '**/api/v1/workspaces/*/admin/audit-log*'],
  ];
  const out=[];
  for (const [path, pattern] of CASES) {
    let delayed=0;
    await page.route(pattern, async r => { delayed++; await new Promise(s=>setTimeout(s,3500)); await r.continue(); });
    const samples=[];
    const nav = page.goto(`https://airion-cargo.store/w/${W}/settings/${path}`, { waitUntil:'domcontentloaded' }).catch(()=>{});
    // sample the screen WHILE the request is in flight
    for (let i=0;i<10;i++) {
      await page.waitForTimeout(450);
      try {
        const s = await page.evaluate(`(() => { const vis=(${VIS});
          const main=document.querySelector('main')||document.body;
          const t=(main.innerText||'').replace(/\\s+/g,' ');
          const i=t.lastIndexOf('›');
          const body=(i>=0?t.slice(i+1):t).trim();
          return { chars:body.length,
            spinner: !!document.querySelector('[role=progressbar],[aria-busy="true"],[class*=spin],[class*=skeleton],[data-loading]'),
            saysLoading:/loading|загруж|подожд/i.test(body),
            saysEmpty:/no members|no roles|no entries|nothing|empty|никого|нет записей/i.test(body),
            head:body.slice(0,90) }; })()`);
        samples.push(s);
      } catch {}
    }
    await nav;
    await page.waitForTimeout(1500);
    const settled = await page.evaluate(`(() => { const vis=(${VIS});
      const main=document.querySelector('main')||document.body;
      const t=(main.innerText||'').replace(/\\s+/g,' ');
      return { chars:t.length, rows:[...main.querySelectorAll('tr')].filter(vis).length }; })()`);
    await page.unroute(pattern);
    out.push({ path, delayedRequests:delayed,
      everShowedSpinnerOrSkeleton: samples.some(s=>s.spinner||s.saysLoading),
      everShowedEmptyState: samples.some(s=>s.saysEmpty),
      firstSample: samples[0], midSample: samples[Math.floor(samples.length/2)], settled });
  }
  return out;
};
