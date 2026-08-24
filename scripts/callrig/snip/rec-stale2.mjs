export default async ({page}) => {
  const M = process.env.QA_MEET;
  const tag = 'qaT'+Date.now();
  const toasts = [];
  await page.exposeFunction(tag, t => toasts.push({t, at: Date.now()}));
  await page.evaluate((tag) => {
    const seen = new Set();
    window.__qaInt && clearInterval(window.__qaInt);
    window.__qaInt = setInterval(() => {
      document.querySelectorAll('[data-sonner-toast],[role="status"],[role="alert"]').forEach(e => {
        const t = e.innerText.replace(/\n+/g,' ').trim();
        if (t && !seen.has(t)) { seen.add(t); window[tag] && window[tag](t.slice(0,140)); }
      });
    }, 150);
  }, tag);
  const state = () => page.evaluate(() => {
    const tb=document.querySelector('[data-testid="call-toolbar"]');
    const b=[...tb.querySelectorAll('button')].find(x=>/record/i.test(x.getAttribute('aria-label')||''));
    return b ? {aria:b.getAttribute('aria-label'), col:getComputedStyle(b).color,
                badge: !!document.querySelector('[data-testid="call-recording-badge"]')} : {none:true};
  });
  const api = () => page.evaluate(async (M)=>{
    const j=await (await fetch('/api/v1/meeting/'+M+'/recordings',{credentials:'include'})).json();
    const r=(j.recordings||[]).sort((a,b)=>(b.started_at>a.started_at?1:-1))[0];
    return r?{st:r.status,dur:r.duration_sec}:null;}, M);

  const t0=Date.now();
  await page.click('[data-testid="recording-start-access-trigger"]');
  await page.waitForTimeout(1500);
  const db = page.locator('[role="dialog"] button', {hasText:'Start recording'}).first();
  if (await db.count()) await db.click();
  await page.waitForTimeout(18000);
  const before = {ui: await state(), api: await api()};

  const tStop=Date.now();
  await page.locator('[data-testid="call-toolbar"] button[aria-label="Stop recording"]').first().click();
  const trace=[];
  let flipped=null;
  for (let i=0;i<45;i++){
    await page.waitForTimeout(1000);
    const s=await state();
    const dt=Math.round((Date.now()-tStop)/1000);
    if (i%3===0 || (s.aria==='Record' && !flipped)) trace.push({s:dt, aria:s.aria, badge:s.badge});
    if (s.aria==='Record' && !flipped){ flipped=dt; break; }
  }
  const apiAt = await page.evaluate(async (M)=>{
    const j=await (await fetch('/api/v1/meeting/'+M+'/recordings',{credentials:'include'})).json();
    const r=(j.recordings||[])[0]; return r?{st:r.status,dur:r.duration_sec}:null;}, M);
  return {before, buttonFlippedBackAfterSec: flipped, trace,
          apiAfter: apiAt,
          toasts: toasts.map(x=>({sec: Math.round((x.at-tStop)/1000), t:x.t}))};
};
