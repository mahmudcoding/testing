const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const PATH = process.env.D2_PATH || 'appearance';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/${PATH}`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2800);
  await page.evaluate(`(() => { const b=document.querySelector('a,button'); if(b) b.focus(); })()`);
  const order=[];
  for (let i=0;i<70;i++) {
    await page.keyboard.press('Tab');
    const f = await page.evaluate(`(() => { const e=document.activeElement; if(!e) return null;
      const r=e.getBoundingClientRect();
      return { t:((e.innerText||'').trim().slice(0,22))||e.getAttribute('aria-label')||('<'+e.tagName.toLowerCase()+'>'),
               x:Math.round(r.x), y:Math.round(r.y), inMain: !!e.closest('main') }; })()`);
    if (!f) break;
    if (f.inMain && f.x>300) order.push(f);
    if (order.length>=25) break;
  }
  // does tab order follow visual order (top to bottom)?
  let inversions=0; const jumps=[];
  for (let i=1;i<order.length;i++) {
    if (order[i].y < order[i-1].y - 12) { inversions++; jumps.push(`${order[i-1].t}(y=${order[i-1].y}) -> ${order[i].t}(y=${order[i].y})`); }
  }
  return { path:PATH, stops:order.length, inversions, jumps:jumps.slice(0,5),
           sequence: order.map(o=>`${o.t}@${o.y}`).slice(0,20) };
};
