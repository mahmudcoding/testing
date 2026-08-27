export default async ({page}) => {
  const ms = Number(process.env.QA_MS || 30000);
  return await page.evaluate(async (ms) => {
    const seen = [];
    const t0 = Date.now();
    const snap = () => [...document.querySelectorAll('[data-testid="participant-reaction-burst"]')].map(e => {
      // walk up to the participant tile and read the name
      let n = e, tile = null;
      for (let i=0; i<12 && n; i++, n = n.parentElement) {
        if (n.getAttribute && n.getAttribute('data-testid') === 'participant-tile') { tile = n; break; }
      }
      const nameEl = tile && tile.querySelector('[data-testid="participant-name"]');
      return {emoji: (e.innerText||'').trim(), onTile: nameEl ? nameEl.innerText.trim() : (tile ? '(tile,no name)' : '(no tile ancestor)')};
    });
    let last = '[]';
    while (Date.now() - t0 < ms) {
      await new Promise(r=>setTimeout(r,200));
      const cur = snap(), s = JSON.stringify(cur);
      if (s !== last && cur.length) { seen.push({at: Date.now()-t0, bursts: cur}); last = s; }
      else if (s !== last) last = s;
    }
    return {bursts: seen};
  }, ms);
};
