export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const PATH = process.env.D2_PATH || 'appearance';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/${PATH}`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2800);
  await page.evaluate(`(() => { const b=document.querySelector('a,button'); if(b) b.focus(); })()`);
  const order=[]; const seen=new Set();
  for (let i=0;i<80;i++) {
    await page.keyboard.press('Tab');
    const f = await page.evaluate(`(() => { const e=document.activeElement; if(!e) return null;
      const r=e.getBoundingClientRect();
      const key=(e.id||'')+'|'+((e.innerText||'').trim().slice(0,18))+'|'+Math.round(r.y+window.scrollY);
      return { key,
        t:((e.innerText||'').trim().slice(0,20))||e.getAttribute('aria-label')||('<'+e.tagName.toLowerCase()+'>'),
        absY: Math.round(r.y + window.scrollY), absX: Math.round(r.x + window.scrollX),
        inMain: !!e.closest('main') }; })()`);
    if (!f) break;
    if (seen.has(f.key)) break;           // full cycle completed
    seen.add(f.key);
    if (f.inMain && f.absX>300) order.push(f);
  }
  let inversions=0; const jumps=[];
  for (let i=1;i<order.length;i++) {
    if (order[i].absY < order[i-1].absY - 12) { inversions++; jumps.push(`${order[i-1].t}(y=${order[i-1].absY}) -> ${order[i].t}(y=${order[i].absY})`); }
  }
  return { path:PATH, stops:order.length, inversions, jumps:jumps.slice(0,4),
           sequence: order.map(o=>`${o.t}@${o.absY}`) };
};
