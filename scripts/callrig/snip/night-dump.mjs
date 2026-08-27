export default async ({page}) => {
  return await page.evaluate(() => {
    const all = [...document.querySelectorAll('button,[role="button"]')].map(b => ({
      l: (b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,45),
      t: b.getAttribute('data-testid')||null,
      d: !!b.disabled,
      p: b.getAttribute('aria-pressed'),
      exp: b.getAttribute('aria-expanded')
    })).filter(x => x.l || x.t);
    const testids = [...document.querySelectorAll('[data-testid]')].map(e=>e.getAttribute('data-testid'));
    return {
      url: location.href,
      buttons: all,
      testidSample: [...new Set(testids)].slice(0,80),
      videoCount: document.querySelectorAll('video').length
    };
  });
};
