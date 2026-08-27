const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const out={};
  for (const [k,p] of [['unknown section','settings/nosuchsection'],
                       ['deep unknown','settings/admin/nosuchthing'],
                       ['unknown workspace','w/W4QNOTAWORKSPACE/settings/account']]) {
    const url = k==='unknown workspace' ? `https://airion-cargo.store/${p}`
                                        : `https://airion-cargo.store/w/${W}/${p}`;
    const resp = await page.goto(url, { waitUntil:'networkidle' }).catch(()=>null);
    await page.waitForTimeout(2400);
    out[k] = await page.evaluate(`(() => { const vis=(${VIS});
      const b=document.body; const t=(b.innerText||'').replace(/\\s+/g,' ');
      const ctl=[...b.querySelectorAll('button,a[href]')].filter(vis).length;
      return { landedOn: location.pathname.slice(0,54),
               notFound:/not found|404/i.test(t), wentWrong:/went wrong/i.test(t),
               controls:ctl, start:t.slice(0,90) }; })()`);
    out[k].httpStatus = resp? resp.status() : 'nav-failed';
  }
  return out;
};
