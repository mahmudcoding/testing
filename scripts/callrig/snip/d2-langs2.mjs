const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/account`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2600);
  const opened = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const b=[...main.querySelectorAll('button')].filter(vis)
      .filter(x=>(x.innerText||'').trim()==='English');
    if(b.length!==1) return {n:b.length}; b[0].click(); return {n:1}; })()`);
  await page.waitForTimeout(1200);
  const list = await page.evaluate(`(() => { const vis=(${VIS});
    const opts=[...document.querySelectorAll('[role=option],[role=menuitem],[role=menuitemradio],li')]
      .filter(vis).map(o=>({ text:(o.innerText||'').replace(/\\s+/g,' ').trim().slice(0,30),
                             selected:o.getAttribute('aria-selected')||o.getAttribute('aria-checked')||'' }))
      .filter(o=>o.text);
    return opts.slice(0,14); })()`);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  const stillEnglish = await page.evaluate(`(() => (document.querySelector('main')||document.body).innerText.includes('English'))()`);
  return { opened, options:list, stillEnglishAfterEscape: stillEnglish };
};
