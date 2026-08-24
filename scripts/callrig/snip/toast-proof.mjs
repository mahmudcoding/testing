export default async ({ctx, page}) => {
  const tok = process.env.QA_TOKEN, name = process.env.QA_GNAME||'Proof Probe';
  // 1. snapshot who is in the call and when they joined, from the host-side API is not available here;
  //    use the public meeting endpoint from the already-joined guest page.
  const before = await page.evaluate(async () => {
    const r = await fetch('/api/v1/meeting/V4OTLVMJL42ZGIG/participants',{credentials:'include'});
    const j = await r.json();
    return {now: new Date().toISOString(), participants: (j.participants||[]).map(p=>({n:p.name, joined_at:p.joined_at}))};
  });
  const p = await ctx.newPage();
  const toasts = [];
  await p.exposeFunction('__qaToast', t => toasts.push({t, at: new Date().toISOString()}));
  await p.addInitScript(() => {
    const seen = new Set();
    setInterval(() => {
      document.querySelectorAll('[data-sonner-toast],[role="status"],[role="alert"]').forEach(e => {
        const t = e.innerText.replace(/\n+/g,' ').trim();
        if (t && !seen.has(t)) { seen.add(t); window.__qaToast && window.__qaToast(t.slice(0,120)); }
      });
    }, 200);
  });
  await p.goto('https://airion-cargo.store/join/'+tok, {waitUntil:'domcontentloaded'});
  await p.waitForTimeout(2500);
  await p.fill('input[type=text]', name);
  const joinedAt = new Date().toISOString();
  await p.locator('button', {hasText:'Join call'}).first().click();
  await p.waitForTimeout(10000);
  await p.close();
  return {before, joinClickAt: joinedAt, toasts};
};
