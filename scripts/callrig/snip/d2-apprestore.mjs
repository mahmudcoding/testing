const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/appearance', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  return await page.evaluate(`(() => { const vis = ${VIS};
    const main = document.querySelector('main');
    const heads = [...main.querySelectorAll('h1,h2,h3,h4')].filter(vis);
    const groups = [];
    for (const h of heads) {
      let box = h.parentElement;
      for (let i = 0; i < 5 && box; i++) { if (box.querySelectorAll('button').length >= 1) break; box = box.parentElement; }
      if (!box) continue;
      const btns = [...box.querySelectorAll('button')].filter(vis).map(b => {
        const t = (b.innerText||'').trim().split('\\n')[0].slice(0,26);
        const c = b.getAttribute('aria-checked');
        return t + '=' + (c === null ? '(no state)' : c);
      });
      if (btns.length) groups.push({ heading: h.innerText.trim().slice(0,30), controls: btns.slice(0,8) });
    }
    let stored = {}; try { stored = JSON.parse(localStorage.getItem('aloqa.appearance')||'{}'); } catch {}
    return { stored, groups: groups.filter((g,i,a)=>a.findIndex(x=>x.heading===g.heading)===i) }; })()`);
};
