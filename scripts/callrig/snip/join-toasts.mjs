export default async ({ctx}) => {
  const tok = process.env.QA_TOKEN, name = process.env.QA_GNAME||'Toast Probe';
  const p = await ctx.newPage();
  const toasts = [];
  await p.exposeFunction('__qaToast', t => toasts.push({t, at: Date.now()}));
  await p.addInitScript(() => {
    const seen = new Set();
    setInterval(() => {
      document.querySelectorAll('[data-sonner-toast],[role="status"],[role="alert"]').forEach(e => {
        const t = e.innerText.replace(/\n+/g,' ').trim();
        if (t && !seen.has(t)) { seen.add(t); window.__qaToast && window.__qaToast(t.slice(0,120)); }
      });
    }, 250);
  });
  await p.goto('https://airion-cargo.store/join/'+tok, {waitUntil:'domcontentloaded'});
  await p.waitForTimeout(2500);
  await p.fill('input[type=text]', name);
  const t0 = Date.now();
  await p.locator('button', {hasText:'Join call'}).first().click();
  await p.waitForTimeout(12000);
  const parts = await p.evaluate(() => {
    const surface = document.querySelector('[role="dialog"]') || document.body;
    return surface.innerText.replace(/\n+/g,' | ').slice(0,300);
  });
  await p.close();
  return {toasts: toasts.map(x=>({dt: x.at-t0, t: x.t})), parts};
};
