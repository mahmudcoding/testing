const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/admin/company`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2800);
  const before = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const i=(main.innerText||'').replace(/\\s+/g,' ');
    return { text:i.slice(i.lastIndexOf('›')+1).trim(),
      inputs:[...main.querySelectorAll('input')].filter(vis).map(e=>({v:e.value,ph:e.getAttribute('placeholder')||''})),
      buttons:[...main.querySelectorAll('button')].filter(vis).filter(e=>e.getBoundingClientRect().left>300).map(e=>(e.innerText||'').trim()) }; })()`);
  await page.locator('button', { hasText: /^Edit company profile$/ }).first().click({ timeout: 5000 });
  await page.waitForTimeout(2500);
  const after = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const i=(main.innerText||'').replace(/\\s+/g,' ');
    return { url:location.pathname, text:i.slice(i.lastIndexOf('›')+1).trim(),
      inputs:[...main.querySelectorAll('input')].filter(vis)
        .map(e=>({v:e.value, ph:e.getAttribute('placeholder')||'', type:e.getAttribute('type')||'',
                  y:Math.round(e.getBoundingClientRect().top)})),
      buttons:[...main.querySelectorAll('button')].filter(vis).filter(e=>e.getBoundingClientRect().left>300)
        .map(e=>({t:(e.innerText||'').trim().slice(0,30), dis:e.disabled===true, y:Math.round(e.getBoundingClientRect().top)})) }; })()`);
  return { before, after };
};
