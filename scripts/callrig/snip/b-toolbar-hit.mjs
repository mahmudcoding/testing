export default async ({page}) => {
  const id = process.env.QA_CH;
  if (!page.url().includes(id)) {
    await page.goto(`https://airion-cargo.store/w/W4QBF1XTURESO01/c/${id}`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(3500);
  }
  const ids = await page.evaluate(() => [...document.querySelectorAll('[data-message-id]')].map(e=>e.getAttribute('data-message-id')));
  const out = [];
  for (const mid of ids) {
    const art = await page.$(`[data-message-id="${mid}"]`);
    await art.hover(); await page.waitForTimeout(600);
    const r = await page.evaluate((mid) => {
      const a = document.querySelector(`[data-message-id="${mid}"]`);
      const btn = [...a.querySelectorAll('button')].find(b => /more/i.test(b.getAttribute('aria-label')||''));
      if (!btn) return {mid, more:false};
      const rc = btn.getBoundingClientRect();
      const cx = rc.x + rc.width/2, cy = rc.y + rc.height/2;
      const top = document.elementFromPoint(cx, cy);
      const cs = getComputedStyle(btn);
      return {mid, more:true,
        rect:{x:Math.round(rc.x),y:Math.round(rc.y),w:Math.round(rc.width),h:Math.round(rc.height)},
        pointerEvents: cs.pointerEvents, opacity: cs.opacity, visibility: cs.visibility,
        topAtCenter: top ? (top.tagName+'['+(top.getAttribute('aria-label')||top.className||'').toString().slice(0,45)+']') : null,
        hitsButton: !!(top && (top===btn || btn.contains(top)))};
    }, mid);
    out.push(r);
  }
  return {innerW: await page.evaluate(()=>innerWidth), out};
};
