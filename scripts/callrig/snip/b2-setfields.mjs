export default async ({ page }) => {
  const net = [];
  page.on('request', r => { if (/\/api\/v1\//.test(r.url()) && r.method()!=='GET')
    net.push({ m:r.method(), u:r.url().replace(/^https?:\/\/[^/]+/,'').slice(0,46), post:(r.postData()||'').slice(0,130) }); });
  const clickReal = async (sel) => {
    const box = await page.evaluate(s => { const e=document.querySelector(s); if(!e) return null;
      const r=e.getBoundingClientRect(); if(r.width===0||r.height===0) return null;
      return { x:r.x+r.width/2, y:r.y+r.height/2 }; }, sel);
    if (!box) return false;
    await page.mouse.move(box.x, box.y); await page.waitForTimeout(140);
    await page.mouse.click(box.x, box.y); return true; };
  const setField = async (tid, val) => {
    const ok = await page.evaluate(([t, v]) => {
      const e = document.querySelector(`[data-testid="${t}"]`);
      if (!e || e.getBoundingClientRect().width === 0) return false;
      const proto = e instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
      setter.call(e, String(v));
      e.dispatchEvent(new Event('input', { bubbles: true }));
      e.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }, [tid, val]);
    if (!ok) return 'not-visible';
    await page.waitForTimeout(500);
    return page.evaluate(t => document.querySelector(`[data-testid="${t}"]`).value, tid);
  };
  const name = process.env.QA_NAME, limit = process.env.QA_LIMIT;
  const out = {};
  if (name)  out.nameTyped  = await setField('meeting-settings-name-input', name);
  if (limit) out.limitTyped = await setField('meeting-settings-max-participants-input', limit);
  await clickReal('[data-testid="meeting-settings-save"]');
  await page.waitForTimeout(4500);
  out.server = await page.evaluate(async (id) => {
    const r = await fetch(`/api/v1/meeting/${id}`, {credentials:'include'});
    const t = await r.text();
    return { name: (t.match(/"name":"([^"]*)"/)||[])[1],
             max: (t.match(/"max_participants":(\d+)/)||[])[1] };
  }, process.env.QA_MEETING);
  out.toasts = await page.evaluate(() => [...document.querySelectorAll('[role="status"],[role="alert"],[class*="toast"]')]
    .filter(e=>e.getBoundingClientRect().height>0).map(e=>e.innerText.replace(/\n+/g,' | ').slice(0,110)).filter(Boolean));
  out.requests = net;
  return out;
};
