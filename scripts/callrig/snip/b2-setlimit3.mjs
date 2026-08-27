export default async ({ page }) => {
  const net = [];
  page.on('request', r => { if (/\/api\/v1\//.test(r.url()) && r.method()!=='GET')
    net.push({ m:r.method(), u:r.url().replace(/^https?:\/\/[^/]+/,'').slice(0,50), post:(r.postData()||'').slice(0,120) }); });
  const clickReal = async (sel) => {
    const box = await page.evaluate(s => { const e=document.querySelector(s); if(!e) return null;
      const r=e.getBoundingClientRect(); if(r.width===0||r.height===0) return null;
      return { x:r.x+r.width/2, y:r.y+r.height/2 }; }, sel);
    if (!box) return false;
    await page.mouse.move(box.x, box.y); await page.waitForTimeout(150);
    await page.mouse.click(box.x, box.y); return true; };
  // open settings if needed
  let vis = await page.evaluate(() => { const e=document.querySelector('[data-testid="meeting-settings-approval-toggle"]');
    return e ? e.getBoundingClientRect().width>0 : false; });
  if (!vis) { await clickReal('[data-testid="call-controls-settings-toggle"]'); await page.waitForTimeout(2200); }
  // locate the limit input
  const found = await page.evaluate(() => {
    const t = document.querySelector('[data-testid="meeting-settings-approval-toggle"]');
    let root = t; for (let i=0;i<8 && root.parentElement;i++){ root=root.parentElement;
      if ((root.innerText||'').includes('PARTICIPANT LIMIT')) break; }
    const inp = [...root.querySelectorAll('input')].find(e=>e.getBoundingClientRect().width>0
      && (e.type==='number' || e.type==='text'));
    if (!inp) return null;
    inp.setAttribute('data-qa-limit','1');
    return { type: inp.type, value: inp.value, tid: inp.getAttribute('data-testid') };
  });
  if (!found) return { error: 'limit input not found' };
  await clickReal('[data-qa-limit="1"]');
  await page.keyboard.press('Control+A'); await page.keyboard.press('Meta+A');
  await page.keyboard.type(String(process.env.QA_LIMIT || '2'));
  await page.waitForTimeout(600);
  const typed = await page.evaluate(() => document.querySelector('[data-qa-limit="1"]').value);
  await clickReal('[data-testid="meeting-settings-save"]');
  await page.waitForTimeout(4000);
  const server = await page.evaluate(async (id) => {
    const r = await fetch(`/api/v1/meeting/${id}`, {credentials:'include'});
    const t = await r.text(); const m = t.match(/"max_participants":(\d+)/); return m ? m[1] : t.slice(0,60);
  }, process.env.QA_MEETING);
  const toasts = await page.evaluate(() => [...document.querySelectorAll('[role="status"],[role="alert"],[class*="toast"]')]
    .filter(e=>e.getBoundingClientRect().height>0).map(e=>e.innerText.replace(/\n+/g,' | ').slice(0,120)).filter(Boolean));
  return { inputFound: found, typed, serverMaxParticipants: server, toasts, requests: net };
};
