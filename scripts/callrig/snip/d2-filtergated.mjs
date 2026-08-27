const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/account`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2600);
  const navBefore = await page.evaluate(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('a[href*="/settings/"]')].filter(vis).map(a=>(a.innerText||'').trim()).filter(Boolean); })()`);
  const out={ navBefore };
  for (const q of ['audit','invit','role','zzz']) {
    await page.evaluate(`(() => { const vis=(${VIS});
      const i=[...document.querySelectorAll('input')].filter(vis)
        .filter(e=>(e.getAttribute('placeholder')||'')==='Filter settings')[0];
      if(!i) return; i.focus();
      const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
      setter.call(i,''); i.dispatchEvent(new Event('input',{bubbles:true})); })()`);
    await page.waitForTimeout(300);
    await page.keyboard.type(q, { delay: 50 });
    await page.waitForTimeout(1200);
    out[q] = await page.evaluate(`(() => { const vis=(${VIS});
      const links=[...document.querySelectorAll('a[href*="/settings/"]')].filter(vis).map(a=>(a.innerText||'').trim()).filter(Boolean);
      const body=(document.body.innerText||'').replace(/\\s+/g,' ');
      return { visibleNav:links, emptyMsg:/no (results|matches)|ничего/i.test(body) }; })()`);
  }
  return out;
};
