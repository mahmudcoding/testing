export default async ({ page }) => {
  const t0 = Date.now(); let found = null, seen = [];
  while ((Date.now() - t0) < 30000 && !found) {
    const r = await page.evaluate(() => {
      const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
      const layer = document.querySelector('[data-testid="incoming-call-priority-layer"]');
      const scope = layer || document;
      const btns = [...scope.querySelectorAll('button')].filter(v)
        .map(b=>({ tid:b.getAttribute('data-testid'), al:b.getAttribute('aria-label'),
                   t:(b.innerText||'').trim().slice(0,20) }));
      const dec = [...scope.querySelectorAll('button')].filter(v)
        .find(b=>/decline/i.test((b.getAttribute('data-testid')||'')+(b.getAttribute('aria-label')||'')+b.textContent));
      return { hasLayer: !!layer, layerText: layer ? layer.innerText.replace(/\n+/g,' | ').slice(0,120) : null,
               btns: layer ? btns : btns.filter(b=>/decline|accept/i.test((b.tid||'')+(b.al||'')+b.t)),
               declineFound: !!dec };
    }).catch(()=>({}));
    if (r.hasLayer) seen.push({ t: Math.round((Date.now()-t0)/100)/10, text: r.layerText, btns: r.btns });
    if (r.declineFound) {
      found = await page.evaluate(() => {
        const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
        const layer = document.querySelector('[data-testid="incoming-call-priority-layer"]') || document;
        const b = [...layer.querySelectorAll('button')].filter(v)
          .find(x=>/decline/i.test((x.getAttribute('data-testid')||'')+(x.getAttribute('aria-label')||'')+x.textContent));
        if (!b) return null;
        const id = { tid:b.getAttribute('data-testid'), al:b.getAttribute('aria-label'), t:b.textContent.trim() };
        b.click(); return id;
      });
      break;
    }
    await page.waitForTimeout(400);
  }
  return { declinedAt: found ? Math.round((Date.now()-t0)/100)/10 : null, clicked: found, sightings: seen.slice(0,3) };
};
