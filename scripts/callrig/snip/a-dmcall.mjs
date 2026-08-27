export default async ({page}) => {
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(/\/api\/v1\/meeting/.test(u) && r.request().method()==='POST'){let b='';try{b=(await r.text()).slice(0,240);}catch(e){} net.push(`${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/chat/saved', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(2500);
  // click the DM with QA Bob in the sidebar
  const dm = page.locator('nav :text("QA Bob"), aside :text("QA Bob")').first();
  if (await dm.count()) { await dm.click(); await page.waitForTimeout(3000); }
  const before = await page.evaluate(()=>({url:location.href, btns:[...document.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||'').trim()).filter(x=>/call|Call/.test(x))}));
  const callBtn = page.locator('button[aria-label*="call" i]').first();
  const t0 = Date.now();
  if (await callBtn.count()) { await callBtn.click(); await page.waitForTimeout(2500); }
  const after = await page.evaluate(()=>({url:location.href, body:document.body.innerText.replace(/\n+/g,' | ').slice(0,400),
    btns:[...document.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim()).filter(Boolean).slice(0,14)}));
  return {before, after, net, t0iso: new Date(t0).toISOString()};
};
