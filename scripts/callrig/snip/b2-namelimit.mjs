export default async ({ page }) => {
  const val = process.env.QA_NAMEVAL;
  const net = [];
  page.on('response', async r => { if (/\/api\/v1\/meeting\//.test(r.url()) && r.request().method()!=='GET') {
    let b=''; try { b=(await r.text()).slice(0,160); } catch {}
    net.push({ st:r.status(), post:(r.request().postData()||'').slice(0,90), body:b }); } });
  const set = await page.evaluate(v => {
    const e = document.querySelector('[data-testid="meeting-settings-name-input"]');
    if (!e || e.getBoundingClientRect().width===0) return 'not-visible';
    const s = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;
    s.call(e, ''); e.dispatchEvent(new Event('input',{bubbles:true}));
    s.call(e, v); e.dispatchEvent(new Event('input',{bubbles:true}));
    e.dispatchEvent(new Event('change',{bubbles:true}));
    return { typed: e.value.length, maxLength: e.getAttribute('maxlength') }; }, val);
  await page.waitForTimeout(700);
  const saveState = await page.evaluate(() => {
    const b = document.querySelector('[data-testid="meeting-settings-save"]');
    return b ? { disabled: b.disabled } : 'no-save'; });
  await page.evaluate(() => { const b=document.querySelector('[data-testid="meeting-settings-save"]');
    if (b && !b.disabled) b.click(); });
  await page.waitForTimeout(3500);
  const server = await page.evaluate(async id => {
    const r = await fetch(`/api/v1/meeting/${id}`, {credentials:'include'});
    const t = await r.text(); const m = t.match(/"name":"((?:[^"\\]|\\.)*)"/);
    return m ? { len: m[1].length, sample: m[1].slice(0,40) } : 'no name'; }, process.env.QA_MEETING);
  const toasts = await page.evaluate(() => [...document.querySelectorAll('[role="status"],[role="alert"],[class*="toast"]')]
    .filter(e=>e.getBoundingClientRect().height>0).map(e=>e.innerText.replace(/\n+/g,' ').slice(0,70)).filter(Boolean));
  return { requested: val.length, set, saveState, net, server, toasts };
};
