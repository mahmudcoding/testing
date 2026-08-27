const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/company`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2600);
  const links = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    return [...main.querySelectorAll('a[href],button')].filter(vis)
      .filter(e=>/^Manage /.test((e.innerText||'').trim()))
      .map(e=>({ text:(e.innerText||'').trim().slice(0,24), tag:e.tagName.toLowerCase(),
                 href:(e.getAttribute('href')||'').slice(0,60) })); })()`);
  const results=[];
  for (const l of links) {
    await page.goto(`https://airion-cargo.store/w/${W}/settings/company`, { waitUntil:'networkidle' });
    await page.waitForTimeout(1800);
    const before = page.url();
    await page.evaluate(`(() => { const vis=(${VIS});
      const main=document.querySelector('main')||document.body;
      const e=[...main.querySelectorAll('a[href],button')].filter(vis)
        .filter(x=>(x.innerText||'').trim()===${JSON.stringify('')}+arguments[0])[0];
      if(e) e.click(); })()`, l.text).catch(()=>{});
    await page.waitForTimeout(2600);
    const landed = await page.evaluate(`(() => { const vis=(${VIS});
      const main=document.querySelector('main')||document.body;
      const t=(main.innerText||'').replace(/\\s+/g,' ');
      return { url: location.pathname, refused:/Admin access required/i.test(t),
               heading: (t.match(/^[A-Za-z ]{3,30}/)||[])[0]||'' }; })()`);
    results.push({ link:l.text, href:l.href, ...landed, moved: landed.url!==new URL(before).pathname });
  }
  return { links, results };
};
