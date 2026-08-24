export default async ({page, ctx}) => {
  const M = process.env.QA_MEET;
  const tag = 'qaJ'+Date.now();
  const toasts = [];
  await page.exposeFunction(tag, t => toasts.push({t, at: Date.now()}));
  // install on every document so it survives navigation
  await ctx.addInitScript((tag) => {
    const seen = new Set();
    setInterval(() => {
      document.querySelectorAll('[data-sonner-toast],[role="status"],[role="alert"]').forEach(e => {
        const t = e.innerText.replace(/\n+/g,' ').trim();
        if (t && !seen.has(t)) { seen.add(t); window[tag] && window[tag](t.slice(0,140)); }
      });
    }, 150);
  }, tag);
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  toasts.length = 0;                                    // ignore hub-page toasts
  const jb = page.locator('main button', {hasText:/^Join$/}).first();
  if (!(await jb.count())) return {err:'no Join on hub'};
  await jb.click();
  await page.waitForTimeout(4000);
  // prejoin
  const btns = await page.$$('button');
  let clicked=false;
  for (const b of btns) { const t=((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim();
    if (/^Join$/i.test(t)) { toasts.length=0; var tJoin=Date.now(); await b.click(); clicked=true; break; } }
  if (!clicked) return {err:'no prejoin Join', body: await page.evaluate(()=>document.body.innerText.slice(0,200))};
  await page.waitForTimeout(10000);
  const parts = await page.evaluate(async (M)=>((await (await fetch('/api/v1/meeting/'+M+'/participants',{credentials:'include'})).json()).participants||[]).map(p=>p.name+' @'+p.joined_at), M);
  return {joinClickAt: new Date(tJoin).toISOString(),
          toasts: toasts.map(x=>({ms: x.at-tJoin, t:x.t})),
          participants: parts};
};
