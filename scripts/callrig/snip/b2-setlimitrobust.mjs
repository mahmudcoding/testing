export default async ({ page }) => {
  const want = process.env.QA_LIMIT;
  const vis = () => page.evaluate(() => { const e=document.querySelector('[data-testid="meeting-settings-max-participants-input"]');
    return e ? e.getBoundingClientRect().width>0 : false; });
  let open = await vis();
  for (let i=0; i<4 && !open; i++) {
    await page.evaluate(() => { const b=document.querySelector('[data-testid="call-controls-settings-toggle"]'); if(b) b.click(); });
    await page.waitForTimeout(2200); open = await vis();
  }
  if (!open) return { error: 'settings panel would not open' };
  const net = [];
  page.on('request', r => { if (/\/api\/v1\/meeting\//.test(r.url()) && r.method()!=='GET')
    net.push({ m:r.method(), post:(r.postData()||'').slice(0,80) }); });
  await page.evaluate(v => { const e=document.querySelector('[data-testid="meeting-settings-max-participants-input"]');
    const s=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;
    s.call(e,''); e.dispatchEvent(new Event('input',{bubbles:true}));
    s.call(e,String(v)); e.dispatchEvent(new Event('input',{bubbles:true})); }, want);
  await page.waitForTimeout(700);
  await page.evaluate(() => { const b=document.querySelector('[data-testid="meeting-settings-save"]'); if(b && !b.disabled) b.click(); });
  await page.waitForTimeout(4000);
  const err = await page.evaluate(() => {
    const e = document.querySelector('[data-testid="meeting-settings-server-error"]');
    return e ? { text: e.innerText.trim().slice(0,140), role: e.getAttribute('role'),
                 visible: e.getBoundingClientRect().height>0 } : null; });
  const server = await page.evaluate(async id => {
    const r = await fetch(`/api/v1/meeting/${id}`, {credentials:'include'});
    const t = await r.text(); return (t.match(/"max_participants":(\d+)/)||[])[1]; }, process.env.QA_MEETING);
  return { requested: want, requests: net, serverError: err, serverMax: server };
};
