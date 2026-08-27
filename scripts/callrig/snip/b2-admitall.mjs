export default async ({ page }) => {
  const net = [];
  page.on('response', r => { if (/admit/i.test(r.url())) net.push({st:r.status(), m:r.request().method(), u:r.url().slice(-58)}); });
  const clicked = await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find(x=>/^Admit all$/i.test(x.textContent.trim())
      && x.getBoundingClientRect().width>0);
    if (!b) return false; b.click(); return true; });
  await page.waitForTimeout(6000);
  return { clicked, net, after: await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const admits=[...document.querySelectorAll('button')].filter(b=>/^Admit$/.test(b.textContent.trim()) && v(b));
    return { admitCount: admits.length,
             tiles: document.querySelectorAll('[data-testid*="participant-tile"],[class*="participant-tile"]').length,
             inCallLine: (document.body.innerText.match(/\d+ in call/)||['—'])[0] };
  })};
};
