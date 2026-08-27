const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const out={};
  for (const [key,url] of [
      ['settings/admin/company-roles', `https://airion-cargo.store/w/${W}/settings/admin/company-roles`],
      ['docs',                          'https://airion-cargo.store/docs'],
      ['workspace/invite/accept (no token)', 'https://airion-cargo.store/workspace/invite/accept']]) {
    const resp = await page.goto(url, { waitUntil:'networkidle' }).catch(e=>({ status:()=>'ERR', _e:String(e).slice(0,60) }));
    await page.waitForTimeout(2400);
    out[key] = await page.evaluate(`(() => { const vis=(${VIS});
      const main=document.querySelector('main')||document.body;
      const t=(main.innerText||'').replace(/\\s+/g,' ');
      const i=t.lastIndexOf('›'); const body=(i>=0?t.slice(i+1):t).trim();
      const ctl=[...main.querySelectorAll('button,a[href],input,select,textarea,[role=switch],[role=button],[role=tab]')]
        .filter(vis).filter(e=>e.getBoundingClientRect().left>300)
        .map(e=>(e.innerText||e.getAttribute('aria-label')||'').replace(/\\s+/g,' ').trim().slice(0,26)).filter(Boolean);
      return { url:location.pathname+location.search, body: body.slice(0,260),
               controls: ctl.slice(0,12), controlCount: ctl.length }; })()`);
    out[key].httpStatus = typeof resp?.status==='function' ? resp.status() : 'n/a';
  }
  return out;
};
