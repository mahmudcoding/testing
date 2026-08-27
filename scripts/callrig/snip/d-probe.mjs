// Generic sector-D page probe.
// QA_URL   = path to open (relative to origin)
// QA_WAIT  = ms to settle (default 3500)
// Captures the requests THE PAGE makes, snapshotting the array BEFORE any
// in-page fetch of our own (see the rc-4 correction in the 26.08 D log).
export default async ({page}) => {
  const url  = process.env.QA_URL;
  const wait = Number(process.env.QA_WAIT || 3500);
  const seen = [];
  const onResp = r => { try { const u = new URL(r.url()); if (u.pathname.startsWith('/api/')) seen.push(`${r.request().method()} ${u.pathname}${u.search} -> ${r.status()}`); } catch {} };
  page.on('response', onResp);
  await page.goto('https://airion-cargo.store' + url, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(wait);
  const pageRequests = seen.slice();          // SNAPSHOT before any evaluate
  page.off('response', onResp);

  const dom = await page.evaluate(() => {
    const vis = el => {
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) return false;
      let n = el, op = 1;
      while (n && n !== document.documentElement) {
        const cs = getComputedStyle(n);
        if (cs.display === 'none' || cs.visibility === 'hidden') return false;
        op *= parseFloat(cs.opacity || '1');
        n = n.parentElement;
      }
      return op > 0.01;
    };
    const label = el => (el.getAttribute('aria-label') || el.innerText || el.value || el.getAttribute('placeholder') || el.getAttribute('title') || '').replace(/\s+/g,' ').trim().slice(0,70);
    const inter = [...document.querySelectorAll('button,a[href],input,select,textarea,[role=button],[role=tab],[role=switch],[role=checkbox],[role=combobox],[role=menuitem],[contenteditable=true]')]
      .filter(vis)
      .map(el => `${el.tagName.toLowerCase()}${el.type?'['+el.type+']':''}${el.disabled?'(disabled)':''}${el.getAttribute('aria-checked')?'{'+el.getAttribute('aria-checked')+'}':''}: ${label(el)}`);
    const heads = [...document.querySelectorAll('h1,h2,h3,h4,[role=heading]')].filter(vis).map(e=>e.innerText.replace(/\s+/g,' ').trim().slice(0,80));
    return {
      title: document.title,
      vis: document.visibilityState,
      heads: [...new Set(heads)].slice(0,40),
      inter: inter.slice(0,90),
      interCount: inter.length,
      text: (document.body.innerText||'').replace(/\s+/g,' ').slice(0,1200),
    };
  });
  return {url: page.url(), pageRequests: pageRequests.slice(0,30), ...dom};
};
