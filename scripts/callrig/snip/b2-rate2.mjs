export default async ({ page }) => {
  const stars = process.env.QA_STARS || '2';
  const net = [];
  page.on('response', async r => { if (/\/rating/.test(r.url()) && r.request().method()!=='GET') {
    let b=''; try { b=(await r.text()).slice(0,140); } catch {}
    net.push({ st:r.status(), m:r.request().method(), post:(r.request().postData()||'').slice(0,60), body:b }); } });
  const state = await page.evaluate(s => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const all = [1,2,3,4,5].map(n => {
      const b = [...document.querySelectorAll('button')].filter(v)
        .find(x=>(x.getAttribute('aria-label')||'')===`${n} stars`);
      return b ? { n, disabled:b.disabled, pressed:b.getAttribute('aria-pressed') } : { n, missing:true };
    });
    return all; });
  const clicked = await page.evaluate(s => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const b = [...document.querySelectorAll('button')].filter(v)
      .find(x=>(x.getAttribute('aria-label')||'')===`${s} stars`);
    if (!b || b.disabled) return b ? 'disabled' : 'missing'; b.click(); return 'clicked'; }, stars);
  await page.waitForTimeout(3500);
  const api = await page.evaluate(async id => {
    const r = await fetch(`/api/v1/meeting/${id}`, {credentials:'include'});
    const t = await r.text(); return (t.match(/"rating":\{[^}]*\}/)||['none'])[0];
  }, process.env.QA_MEETING);
  return { starsBefore: state, secondClick: clicked, net, apiAfter: api };
};
