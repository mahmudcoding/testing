const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/account`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2800);
  const box = await page.evaluate(`(() => { const vis=(${VIS});
    const e=[...document.querySelectorAll('input')].filter(vis)
      .filter(x=>(x.getAttribute('placeholder')||'')==='Filter settings')[0];
    if(!e) return null; e.scrollIntoView({block:'center'});
    const r=e.getBoundingClientRect(); return {x:Math.round(r.left+r.width/2), y:Math.round(r.top+r.height/2)}; })()`);
  if (!box) return { err:'no filter field for this account' };
  const out={};
  for (const q of ['audit','xyzzy','']) {
    await page.mouse.click(box.x, box.y);
    await page.waitForTimeout(250);
    await page.keyboard.press('Meta+A').catch(()=>{});
    await page.keyboard.press('Control+A').catch(()=>{});
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(400);
    if (q) await page.keyboard.type(q, { delay: 70 });
    await page.waitForTimeout(1400);
    out[q||'(cleared)'] = await page.evaluate(`(() => { const vis=(${VIS});
      const e=[...document.querySelectorAll('input')].filter(vis).filter(x=>(x.getAttribute('placeholder')||'')==='Filter settings')[0];
      return { fieldValue: e?e.value:'(gone)',
        navItems:[...document.querySelectorAll('a[href*="/settings/"]')].filter(vis).map(a=>(a.innerText||'').trim()).filter(Boolean),
        emptyCopy:(()=>{const m=(document.body.innerText||'').match(/No settings[^.]*\\./i); return m?m[0]:null;})() }; })()`);
  }
  return out;
};
