const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const seenReq=[];
  page.on('request', r => { const u=r.url().replace(/^https?:\/\/[^/]+/,''); if(/invite/i.test(u)) seenReq.push(`${r.method()} ${u.slice(0,70)}`); });
  const grab = async tag => page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const t=(main.innerText||'').replace(/\\s+/g,' '); const i=t.lastIndexOf('›');
    const body=(i>=0?t.slice(i+1):t).trim();
    // split by the two section headings
    const linkIdx=body.indexOf('Shareable invites');
    const dirIdx=body.indexOf('Create direct invites');
    return { tag:${JSON.stringify('T')}, whole:body.length,
      linkSection: linkIdx>=0 ? body.slice(linkIdx, dirIdx>linkIdx?dirIdx:linkIdx+420) : '(not found)',
      directSection: dirIdx>=0 ? body.slice(dirIdx, dirIdx+300) : '(not found)',
      rows:[...main.querySelectorAll('tr')].filter(vis).length,
      saysCouldNot:/could not|couldn.t|failed to load|went wrong/i.test(body) }; })()`.replace("'T'", JSON.stringify(tag)));
  await page.goto(`https://airion-cargo.store/w/${W}/settings/admin/invites`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2800);
  const ok = await grab('ok');
  seenReq.length=0;
  let aborted=0;
  await page.route('**/api/v1/workspaces/*/invites', r => { aborted++; r.abort('failed'); });
  await page.goto(`https://airion-cargo.store/w/${W}/settings/admin/invites`, { waitUntil:'domcontentloaded' });
  await page.waitForTimeout(4500);
  const failed = await grab('links-aborted');
  await page.unroute('**/api/v1/workspaces/*/invites');
  return { ok, failed, abortedCount:aborted, inviteRequests:seenReq.slice(0,6) };
};
