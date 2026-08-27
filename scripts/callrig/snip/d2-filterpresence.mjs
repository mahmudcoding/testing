const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const out={};
  const who = await (async()=>{ await page.goto('https://airion-cargo.store/', {waitUntil:'domcontentloaded'}); await page.waitForTimeout(1200);
    return page.evaluate(async()=> (await (await fetch('/api/v1/auth/me',{credentials:'include'})).json()).email); })();
  for (const path of ['account','appearance']) {
    await page.goto(`https://airion-cargo.store/w/${W}/settings/${path}`, { waitUntil:'networkidle' });
    await page.waitForTimeout(3000);
    out[path] = await page.evaluate(`(() => { const vis=(${VIS});
      const t=(document.body.innerText||'').replace(/\\s+/g,' ');
      const inp=[...document.querySelectorAll('input')].filter(e=>(e.getAttribute('placeholder')||'')==='Filter settings');
      return { textHasFilter:/Filter settings/i.test(t),
        inputExists:inp.length, inputVisible:inp.filter(vis).length,
        navCount:[...document.querySelectorAll('a[href*="/settings/"]')].filter(vis).length,
        firstChars:t.slice(0,90) }; })()`);
  }
  return { who, ...out };
};
