export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QEF1XTURESO01/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  return await page.evaluate(() => {
    const vis = el => {
      if (!el) return false;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return false;
      let n = el, op = 1;
      while (n && n !== document.documentElement) { const cs = getComputedStyle(n); if (cs.display==='none'||cs.visibility==='hidden') return false; op *= parseFloat(cs.opacity||'1'); n = n.parentElement; }
      return op > 0.01;
    };
    const nav = document.querySelector('nav') || document.body;
    // enumerate every interactive node outside <main>
    const main = document.querySelector('main');
    const all = [...document.querySelectorAll('button,a,[role=button],[role=tab],[role=menuitem],input')]
      .filter(e => vis(e) && (!main || !main.contains(e)));
    return {
      url: location.href,
      chromeControls: all.map(e => ({
        tag: e.tagName,
        label: (e.getAttribute('aria-label') || e.textContent || '').replace(/\s+/g,' ').trim().slice(0,60),
        testid: e.getAttribute('data-testid') || null,
        href: e.getAttribute('href') || null,
        x: Math.round(e.getBoundingClientRect().left), y: Math.round(e.getBoundingClientRect().top)
      })).slice(0, 80),
      count: all.length,
      innerW: innerWidth, innerH: innerHeight
    };
  });
};
