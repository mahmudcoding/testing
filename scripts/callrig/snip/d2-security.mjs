const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/security`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2800);
  return await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const t=(main.innerText||'').replace(/\\s+/g,' ');
    const i=t.lastIndexOf('›'); const body=(i>=0?t.slice(i+1):t).trim();
    const ctl=[...main.querySelectorAll('button,a[href],input,select,textarea,[role=switch],[role=button],[tabindex]')]
      .filter(vis).filter(e=>e.getBoundingClientRect().left>300)
      .map(e=>(e.innerText||e.getAttribute('aria-label')||e.getAttribute('placeholder')||'').replace(/\\s+/g,' ').trim())
      .filter(Boolean);
    return { subtitlePromisesKeys: /encryption keys/i.test(body),
             mentionsKeysAnywhereElse: (body.match(/encryption/gi)||[]).length,
             bodyChars: body.length, body: body.slice(0,260),
             controls: [...new Set(ctl)] }; })()`);
};
