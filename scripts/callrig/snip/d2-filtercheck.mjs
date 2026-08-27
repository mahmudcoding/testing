const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/account`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2700);
  const find = `(() => { const vis=(${VIS});
    return [...document.querySelectorAll('input')].filter(vis)
      .filter(e=>(e.getAttribute('placeholder')||'')==='Filter settings')[0]; })`;
  const present = await page.evaluate(`(() => { const e=${find}(); return e? {found:true, ph:e.getAttribute('placeholder'), type:e.getAttribute('type')} : {found:false}; })()`);
  if (!present.found) return present;
  // click it (real user action) then type
  await page.evaluate(`(() => { const e=${find}(); e.scrollIntoView({block:'center'}); })()`);
  const box = await page.evaluate(`(() => { const e=${find}(); const r=e.getBoundingClientRect();
    return {x:Math.round(r.left+r.width/2), y:Math.round(r.top+r.height/2)}; })()`);
  await page.mouse.click(box.x, box.y);
  await page.waitForTimeout(400);
  const focusedOn = await page.evaluate(`(() => { const a=document.activeElement;
    return a? (a.tagName.toLowerCase()+'/'+(a.getAttribute('placeholder')||'')) : null; })()`);
  await page.keyboard.type('audit', { delay: 70 });
  await page.waitForTimeout(1400);
  const after = await page.evaluate(`(() => { const vis=(${VIS}); const e=${find}();
    const links=[...document.querySelectorAll('a[href*="/settings/"]')].filter(vis).map(a=>(a.innerText||'').trim()).filter(Boolean);
    const nav=document.querySelector('nav') || document.body;
    return { fieldValue: e? e.value : '(field gone)', navLinks:links,
      anyEmptyCopy:/No settings match/i.test(document.body.innerText||'') }; })()`);
  return { present, clickedAt:box, focusedOn, after };
};
