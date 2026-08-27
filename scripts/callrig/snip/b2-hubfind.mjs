export default async ({ page }) => {
  return await page.evaluate((names) => {
    const t = document.body.innerText || '';
    const out = { url: location.pathname, bodyLen: t.length };
    for (const n of names) out['has_' + n.replace(/\s+/g,'_')] = t.includes(n);
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const cand = [...document.querySelectorAll('div,section,li')].filter(v)
      .filter(e=>/LIVE|Live now/i.test(e.innerText||'') && (e.innerText||'').length < 260);
    const min = cand.filter(e=>!cand.some(o=>o!==e && e.contains(o)));
    out.liveCards = min.slice(0,3).map(e=>e.innerText.replace(/\n+/g,' | ').slice(0,120));
    return out;
  }, ['Rename Alpha', 'Rename Beta']);
};
