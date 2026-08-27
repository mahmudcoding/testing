const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  // collect every settings/admin link reachable from the settings shell
  await page.goto(`https://airion-cargo.store/w/${W}/settings/account`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2800);
  const seen = new Set(); const queue = [];
  const harvest = async () => page.evaluate(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('a[href]')].filter(vis).map(a=>a.getAttribute('href'))
      .filter(h=>h && /\\/settings\\//.test(h)); })()`);
  for (const h of await harvest()) queue.push(h);
  const results=[];
  while (queue.length && results.length < 30) {
    const href = queue.shift();
    const key = href.split('?')[0] + (href.includes('scope=') ? '?'+href.split('?')[1] : '');
    if (seen.has(key)) continue; seen.add(key);
    try {
      await page.goto('https://airion-cargo.store'+href, { waitUntil:'networkidle' });
      await page.waitForTimeout(1600);
      const r = await page.evaluate(`(() => { const vis=(${VIS});
        const main=document.querySelector('main')||document.body;
        const t=(main.innerText||''); const i=t.lastIndexOf('\\u203a');
        const head=(i>=0?t.slice(i+1):t).replace(/\\s+/g,' ').trim().slice(0,60);
        return { head, status404: /not found|404/i.test(t) }; })()`);
      results.push({ route:key, ...r });
      for (const h2 of await harvest()) if (!seen.has(h2.split('?')[0])) queue.push(h2);
    } catch(e) { results.push({ route:key, err:e.message.slice(0,50) }); }
  }
  return { routeCount: results.length, routes: results };
};
