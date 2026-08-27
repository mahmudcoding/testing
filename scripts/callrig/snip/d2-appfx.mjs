const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
const CHFP = `() => {
  const g = (el, ...props) => { if (!el) return null; const s = getComputedStyle(el); const r = el.getBoundingClientRect();
    return props.map(p => p === 'x' ? Math.round(r.x) : p === 'h' ? Math.round(r.height) : s[p]).join('|'); };
  const msgs = [...document.querySelectorAll('[data-message-id]')].slice(0, 4);
  const aside = document.querySelector('aside');
  const comp = document.querySelector('div[contenteditable="true"]');
  const anyTransition = [...document.querySelectorAll('button')].slice(0, 12)
    .map(b => getComputedStyle(b).transitionDuration).filter(d => d && d !== '0s').length;
  return {
    asideStyle: g(aside, 'x', 'backgroundColor'),
    msgHeights: msgs.map(m => Math.round(m.getBoundingClientRect().height)),
    msgPadding: msgs.length ? getComputedStyle(msgs[0]).padding : null,
    msgGap: msgs.length > 1 ? Math.round(msgs[1].getBoundingClientRect().y - msgs[0].getBoundingClientRect().bottom) : null,
    composerPresent: !!comp,
    buttonsWithTransition: anyTransition,
    mainX: Math.round((document.querySelector('main')||{getBoundingClientRect:()=>({x:-1})}).getBoundingClientRect().x)
  };
}`;
export default async ({ page }) => {
  const CH = 'https://airion-cargo.store/w/W4QDF1XTURESO01/c/C4QDGENERAL0001';
  const AP = 'https://airion-cargo.store/w/W4QDF1XTURESO01/settings/appearance';
  const pick = async lbl => (await page.evaluateHandle(`(() => { const vis = ${VIS};
      const all=[...document.querySelectorAll('main button')].filter(vis);
      return all.find(b => { let p=b.parentElement; for(let i=0;i<4&&p;i++){ if(p.querySelectorAll('button').length===1 && (p.innerText||'').trim().startsWith(${JSON.stringify(lbl)})) return true; p=p.parentElement; } return false; })
        || all.find(b => (b.innerText||'').trim() === ${JSON.stringify(lbl)}) || null; })()`)).asElement();

  await page.goto(CH, { waitUntil: 'networkidle' }); await page.waitForTimeout(3500);
  const before = await page.evaluate(`(${CHFP})()`);

  await page.goto(AP, { waitUntil: 'networkidle' }); await page.waitForTimeout(2200);
  const flips = {};
  for (const lbl of ['Animations', 'Light sidebar', 'Show member roles']) {
    const el = await pick(lbl);
    if (!el) { flips[lbl] = 'not found'; continue; }
    await el.scrollIntoViewIfNeeded();
    const b = await el.evaluate(e => e.getAttribute('aria-checked'));
    await el.click(); await page.waitForTimeout(900);
    flips[lbl] = b + ' -> ' + await el.evaluate(e => e.getAttribute('aria-checked'));
  }
  // message layout: the second "Compact" (Message layout group), identified by its group heading
  const ml = await page.evaluateHandle(`(() => { const vis = ${VIS};
    const heads=[...document.querySelectorAll('main h2,main h3,main h4')].filter(vis);
    const h = heads.find(x => /Message layout/i.test(x.innerText||'')); if(!h) return null;
    let box=h.parentElement; for(let i=0;i<4&&box;i++){ if(box.querySelectorAll('button').length>=2) break; box=box.parentElement; }
    return box ? [...box.querySelectorAll('button')].find(b=>/Compact/.test(b.innerText||'')) : null; })()`);
  const mle = ml.asElement();
  if (mle) { await mle.scrollIntoViewIfNeeded(); const b = await mle.evaluate(e=>e.getAttribute('aria-checked'));
    await mle.click(); await page.waitForTimeout(900);
    flips['Message layout Compact'] = b + ' -> ' + await mle.evaluate(e=>e.getAttribute('aria-checked')); }
  else flips['Message layout Compact'] = 'not found';

  const stored = await page.evaluate(() => (localStorage.getItem('aloqa.appearance')||'').slice(0,200));
  await page.goto(CH, { waitUntil: 'networkidle' }); await page.waitForTimeout(3500);
  const after = await page.evaluate(`(${CHFP})()`);
  const changed = {}; for (const k of Object.keys(before))
    if (JSON.stringify(before[k]) !== JSON.stringify(after[k])) changed[k] = [before[k], after[k]];
  return { flips, storedAfterFlips: stored, before, after, changed, unchangedKeys: Object.keys(before).filter(k=>!(k in changed)) };
};
