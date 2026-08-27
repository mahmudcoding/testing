const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const CASES = [
    ['admin/members',        '**/api/v1/companies/*/members*'],
    ['roles?scope=company',  '**/api/v1/companies/*/roles*'],
    ['admin/invites',        '**/api/v1/workspaces/*/invites*'],
    ['admin/audit-log',      '**/api/v1/workspaces/*/admin/audit-log*'],
    ['sessions',             '**/api/v1/**session**'],
    ['privacy',              '**/api/v1/messaging/users/blocked*'],
    ['admin/workspaces',     '**/api/v1/companies/*/workspaces*'],
  ];
  const out=[];
  const grab = async () => page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const t=(main.innerText||'').replace(/\\s+/g,' '); const i=t.lastIndexOf('›');
    const body=(i>=0?t.slice(i+1):t).trim();
    return { chars:body.length, head:body.slice(0,190),
      saysError:/could not|couldn.t|failed|try again|error|unavailable|went wrong|не удалось/i.test(body),
      saysEmpty:/no members|no roles|no invites|nothing|empty|none yet|no entries|no one/i.test(body),
      controls:[...main.querySelectorAll('button,input,select,[role=switch],[role=combobox]')].filter(vis)
        .filter(e=>e.getBoundingClientRect().left>300)
        .filter(e=>(e.getAttribute('placeholder')||'')!=='Filter settings').length,
      rows:[...main.querySelectorAll('tr')].filter(vis).length }; })()`);
  for (const [path, pattern] of CASES) {
    // baseline
    await page.goto(`https://airion-cargo.store/w/${W}/settings/${path}`, { waitUntil:'networkidle' });
    await page.waitForTimeout(2400);
    const ok = await grab();
    // now fail just that endpoint
    let hits=0;
    await page.route(pattern, r => { hits++; r.abort('failed'); });
    await page.goto(`https://airion-cargo.store/w/${W}/settings/${path}`, { waitUntil:'domcontentloaded' });
    await page.waitForTimeout(4200);
    const failed = await grab();
    await page.unroute(pattern);
    out.push({ path, pattern, aborted:hits, ok, failed });
  }
  return out;
};
