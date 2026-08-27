export default async ({page}) => {
  const id = process.env.QA_CH;
  if (!page.url().includes(id)) {
    await page.goto(`https://airion-cargo.store/w/W4QBF1XTURESO01/c/${id}`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(4000);
  }
  const ids = await page.evaluate(() => [...document.querySelectorAll('[data-message-id]')].map(e=>e.getAttribute('data-message-id')));
  const probe = async (mid, waitMs) => {
    const art = await page.$(`[data-message-id="${mid}"]`);
    await art.hover();
    await page.waitForTimeout(waitMs);
    return await page.evaluate((mid) => {
      const a = document.querySelector(`[data-message-id="${mid}"]`);
      const btn = [...a.querySelectorAll('button')].find(b => /more/i.test(b.getAttribute('aria-label')||''));
      if (!btn) return {mid, more:false};
      const rc = btn.getBoundingClientRect();
      const top = document.elementFromPoint(rc.x+rc.width/2, rc.y+rc.height/2);
      const cs = getComputedStyle(btn);
      // also check ancestors for pointer-events none
      let chain = []; let n = btn;
      while (n && n !== document.body) { const c=getComputedStyle(n); if (c.pointerEvents==='none') chain.push(n.tagName+'.'+String(n.className).slice(0,30)); n = n.parentElement; }
      return {mid, pe: cs.pointerEvents, op: cs.opacity, peNoneChain: chain,
              hits: !!(top && (top===btn||btn.contains(top))), y: Math.round(rc.y)};
    }, mid);
  };
  const seq = [];
  // pass 1: first message, long settle
  seq.push({step:'msg1 settle2000', r: await probe(ids[0], 2000)});
  // pass 2: hover last, then first again
  seq.push({step:'msg3', r: await probe(ids[2], 800)});
  seq.push({step:'msg1 again', r: await probe(ids[0], 1500)});
  // pass 3: reverse order fresh
  seq.push({step:'msg2', r: await probe(ids[1], 800)});
  seq.push({step:'msg1 third', r: await probe(ids[0], 2500)});
  return seq;
};
