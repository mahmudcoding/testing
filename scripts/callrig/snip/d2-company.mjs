const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/company`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2800);
  return await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const t=(main.innerText||'').replace(/\\s+/g,' ');
    const i=t.lastIndexOf('›'); const body=(i>=0?t.slice(i+1):t).trim();
    const fields=[...main.querySelectorAll('input,textarea')].filter(vis).filter(e=>e.type!=='search')
      .map(e=>({ tag:e.tagName.toLowerCase(), type:e.type||'', ph:(e.placeholder||'').slice(0,30),
                 val:(e.value||'').slice(0,34), maxlen:e.getAttribute('maxlength') }));
    const btns=[...main.querySelectorAll('button')].filter(vis)
      .map(b=>({ t:(b.innerText||'').trim().slice(0,24), dis:b.disabled===true }));
    return { bodyChars: body.length, body: body.slice(0,300), fields, buttons: btns }; })()`);
};
