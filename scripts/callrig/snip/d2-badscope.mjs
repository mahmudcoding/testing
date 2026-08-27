const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const out={};
  for (const [key,q] of [['valid company','?scope=company'],['bogus value','?scope=bogus'],
                         ['empty value','?scope='],['no param',''],
                         ['injection-ish','?scope=%3Cscript%3E']]) {
    await page.goto(`https://airion-cargo.store/w/${W}/settings/roles${q}`, { waitUntil:'networkidle' });
    await page.waitForTimeout(2400);
    out[key] = await page.evaluate(`(() => { const vis=(${VIS});
      const main=document.querySelector('main')||document.body;
      const t=(main.innerText||'').replace(/\\s+/g,' ');
      const tabs=[...main.querySelectorAll('[role=tab],button')].filter(vis)
        .map(b=>(b.innerText||'').trim()).filter(x=>/Company roles|Workspace roles/.test(x));
      return { url:location.pathname+location.search,
               broke:/went wrong|error|not found/i.test(t),
               tabsShown:[...new Set(tabs)],
               heading:(t.match(/Roles[^]{0,60}/)||[])[0]||t.slice(0,60),
               controls:[...main.querySelectorAll('button,input')].filter(vis)
                 .filter(e=>e.getBoundingClientRect().left>300).length }; })()`);
  }
  return out;
};
