const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const PATH = process.env.D2_PATH || 'profile';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/${PATH}`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2800);
  const expected = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    return [...main.querySelectorAll('button,input,select,textarea,[role=switch],[role=combobox],[role=radio],a[href]')]
      .filter(vis).filter(e=>e.getBoundingClientRect().left>300)
      .filter(e=>(e.getAttribute('placeholder')||'')!=='Filter settings')
      .map(e=>({ id:(e.innerText||'').trim().slice(0,24)||e.getAttribute('aria-label')||('<'+e.tagName.toLowerCase()+'>'),
                 tag:e.tagName.toLowerCase(), tabindex:e.getAttribute('tabindex') })); })()`);
  await page.evaluate(`(() => { document.body.focus(); const a=document.querySelector('a,button'); if(a) a.focus(); })()`);
  const seen=[]; const focusRing=[];
  for (let i=0;i<90;i++) {
    await page.keyboard.press('Tab');
    const f = await page.evaluate(`(() => { const e=document.activeElement; if(!e) return null;
      const r=e.getBoundingClientRect(); const cs=getComputedStyle(e);
      return { tag:e.tagName.toLowerCase(), role:e.getAttribute('role')||'',
        t:((e.innerText||'').trim().slice(0,24))||e.getAttribute('aria-label')||'',
        x:Math.round(r.x), inMain: !!e.closest('main'),
        outline: cs.outlineStyle!=='none' && parseFloat(cs.outlineWidth)>0,
        ring: (cs.boxShadow||'').length>6 }; })()`);
    if (!f) break;
    seen.push(f);
    if (f.inMain && f.x>300) focusRing.push({ t:f.t||('<'+f.tag+'>'), visibleFocus: f.outline||f.ring });
  }
  const contentFocused = seen.filter(s=>s.inMain && s.x>300);
  const names = new Set(contentFocused.map(s=>s.t||('<'+s.tag+'>')));
  const missing = expected.filter(e=>!names.has(e.id));
  return { path:PATH, expectedCount:expected.length, tabStops:seen.length,
           contentTabStops:contentFocused.length,
           reachedNames:[...names].slice(0,24),
           notReached: missing.map(m=>m.id).slice(0,12),
           withoutVisibleFocus: focusRing.filter(f=>!f.visibleFocus).map(f=>f.t).slice(0,10) };
};
