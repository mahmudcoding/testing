export default async ({ page }) => {
  const stars = process.env.QA_STARS || '4';
  const net = [];
  page.on('request', r => { if (/\/api\/v1\/meeting/.test(r.url()) && r.method()!=='GET')
    net.push({ m:r.method(), u:r.url().replace(/^https?:\/\/[^/]+/,'').slice(0,50), post:(r.postData()||'').slice(0,80) }); });
  const clicked = await page.evaluate(s => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const b = [...document.querySelectorAll('button')].filter(v)
      .find(x=>(x.getAttribute('aria-label')||'')===`${s} stars`);
    if (!b) return false; b.click(); return true; }, stars);
  await page.waitForTimeout(3500);
  const toasts = await page.evaluate(() => [...document.querySelectorAll('[role="status"],[role="alert"],[class*="toast"]')]
    .filter(e=>e.getBoundingClientRect().height>0).map(e=>e.innerText.replace(/\n+/g,' ').slice(0,60)).filter(Boolean));
  const api = await page.evaluate(async id => {
    const r = await fetch(`/api/v1/meeting/${id}`, {credentials:'include'});
    const t = await r.text(); return (t.match(/"rating":\{[^}]*\}/)||['no rating field'])[0];
  }, process.env.QA_MEETING);
  return { starClicked: clicked, net, toasts, apiAfterStar: api };
};
