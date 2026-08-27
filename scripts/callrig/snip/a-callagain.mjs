export default async ({page}) => {
  const net=[];
  page.on('response', async r=>{const u=r.url(); const m=r.request().method(); if(/\/api\/v1\/meeting/.test(u) && m!=='GET'){let b='';try{b=(await r.text()).slice(0,200);}catch(e){} net.push(`${m} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  const snap = () => ({url: location.href, summary: !!document.querySelector('[data-testid="call-ended-summary"]'),
     body: document.body.innerText.replace(/\n+/g,' | ').slice(-300),
     dlg: (()=>{const d=[...document.querySelectorAll('[role="dialog"]')].pop(); return d? d.innerText.replace(/\n+/g,' | ').slice(0,220):null;})()});
  const out = {};
  const e = page.locator('[data-testid="call-controls-end-for-everyone"]');
  if (await e.count()) { await e.click(); await page.waitForTimeout(1200);
    const cf = page.locator('[data-testid="call-end-confirm-submit"]'); if (await cf.count()) await cf.click(); }
  await page.waitForTimeout(8000);
  out.ended = await page.evaluate(snap);
  const again = page.locator('button:has-text("Call again")').last();
  out.againFound = await again.count();
  if (out.againFound) { await again.click(); await page.waitForTimeout(6000); }
  out.afterAgain = await page.evaluate(snap);
  out.current = await page.evaluate(async ()=>{const j=await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json(); return j.meeting?{id:j.meeting.id,name:j.meeting.name,status:j.meeting.status}:j;});
  out.net = net;
  return out;
};
