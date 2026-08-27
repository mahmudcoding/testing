export default async ({page}) => {
  const net=[];
  page.on('response', async r=>{const u=r.url(); const m=r.request().method(); if(/\/api\/v1\//.test(u)&&m!=='GET'){net.push(`${m} ${r.status()} ${u.replace('https://airion-cargo.store','')}`);} });
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  const info = await page.evaluate(() => {
    const m=document.querySelector('main')||document.body;
    const pick = t => { const b=[...m.querySelectorAll('button')].find(x=>(x.textContent||'').includes(t)); if(!b) return null;
      const s=getComputedStyle(b);
      return {text:(b.textContent||'').replace(/\s+/g,' ').trim().slice(0,60), disabled:b.disabled, ariaDisabled:b.getAttribute('aria-disabled'), cursor:s.cursor, opacity:s.opacity, pe:s.pointerEvents}; };
    return {webinar: pick('Webinar'), team: pick('Team meeting'), startNow: pick('Start now')};
  });
  const out = {info, netBefore: net.length};
  // click Webinar
  const w = page.locator('main button:has-text("Webinar")').first();
  if (await w.count()) { await w.click({force:true}); await page.waitForTimeout(2500); }
  out.afterWebinar = await page.evaluate(()=>({url:location.href, dlg: (()=>{const d=[...document.querySelectorAll('[role="dialog"]')].pop(); return d? d.innerText.replace(/\n+/g,' | ').slice(0,180):null;})(),
     toast: [...document.querySelectorAll('[role="status"],[role="alert"]')].map(e=>e.innerText.trim()).filter(Boolean).slice(0,3)}));
  out.net = net;
  return out;
};
